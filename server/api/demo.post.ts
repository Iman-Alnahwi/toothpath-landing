import { appendFileSync, mkdirSync } from 'node:fs'
import {
  isValidPhone, nameProblem, normalisePhone, phoneProblem,
} from '~~/shared/validation'

/**
 * «اطلب نسختك التجريبية» — a lab asking to be contacted.
 *
 * ── The only anonymous write in this project ──────────────────────────────
 * There is no session here and there cannot be, so the protections a signed-in
 * endpoint gets for free are supplied by hand:
 *
 *   · validated with the SAME functions the form uses (shared/validation.ts),
 *     so the browser and the server refuse the same input for the same reason;
 *   · rate-limited per IP — a public POST with no limit is the first thing
 *     anybody floods;
 *   · every string length-capped, so a megabyte of text cannot be pushed
 *     through whoever reads these;
 *   · the response is `{ ok: true }` and nothing more. An endpoint that echoes
 *     its input is how a stored payload gets a second life somewhere it is not
 *     escaped.
 *
 * ── Where the row goes ────────────────────────────────────────────────────
 * Three destinations, first one configured wins:
 *
 *   1. `NUXT_DEMO_FORWARD_URL` — the live application's own endpoint.
 *   2. `NUXT_RESEND_API_KEY` — the request is emailed to `NUXT_NOTIFY_EMAIL`.
 *   3. `data/requests.jsonl` — a file, which is the local-development case.
 *
 * The file is last because it is the one that cannot survive deployment: a
 * serverless filesystem is read-only and the instance is discarded after the
 * request. It stays as the default so `pnpm dev` works with no configuration
 * at all, and so a lead typed on a laptop is still readable with `cat`.
 *
 * A file and not SQLite, deliberately: a landing page collects a handful of
 * leads, and a native dependency is a build step every person who clones this
 * repo has to get working before the site will start.
 *
 * ── When delivery fails ───────────────────────────────────────────────────
 * The visitor is told, and told to phone instead. Returning `{ ok: true }` on
 * a lead we did not keep is the failure that costs a customer: they believe
 * they have been in touch, and wait for a call that was never queued. The row
 * is also written to the host's log, which is the last copy that exists.
 */

const recent = new Map<string, number[]>()
const WINDOW_MS = 60 * 60 * 1000
const MAX_PER_WINDOW = 5

function overLimit(ip: string): boolean {
  const now = Date.now()
  const hits = (recent.get(ip) ?? []).filter(t => now - t < WINDOW_MS)
  if (hits.length >= MAX_PER_WINDOW) { recent.set(ip, hits); return true }
  hits.push(now)
  recent.set(ip, hits)
  if (recent.size > 5000) {
    for (const [k, v] of recent) if (!v.some(t => now - t < WINDOW_MS)) recent.delete(k)
  }
  return false
}

function save(row: Record<string, unknown>) {
  mkdirSync('data', { recursive: true })
  appendFileSync('data/requests.jsonl', `${JSON.stringify(row)}\n`, 'utf8')
}

const clip = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)

type Row = {
  at: string
  labName: string
  phone: string
  city: string | null
  note: string | null
}

/* Baghdad, spelled out. A bare ISO string in a notification is a small tax on
   every single read — the lab owner should not be converting from UTC to know
   whether this arrived during working hours. */
function whenReadable(iso: string): string {
  return new Intl.DateTimeFormat('ar-IQ', {
    timeZone: 'Asia/Baghdad',
    dateStyle: 'full',
    timeStyle: 'short',
    numberingSystem: 'latn',
  }).format(new Date(iso))
}

async function email(cfg: ReturnType<typeof useRuntimeConfig>, row: Row) {
  const to = cfg.notifyEmail || cfg.public.contactEmail
  if (!to) throw new Error('no recipient configured')

  /* The phone in the subject, not only the body: a notification read on a
     locked phone screen should already carry the one thing you act on. */
  const subject = `طلب تجربة — ${row.labName} — ${row.phone}`
  const lines = [
    ['المعمل', row.labName],
    ['الهاتف', row.phone],
    ['المدينة', row.city ?? '—'],
    ['الملاحظة', row.note ?? '—'],
    ['وصل', whenReadable(row.at)],
  ]

  await $fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.resendApiKey}` },
    body: {
      from: cfg.mailFrom,
      to: [to],
      subject,
      /* `dir="rtl"` on the wrapper, because a mail client renders this HTML
         with its own defaults and ours are not among them. */
      html: `<div dir="rtl" style="font-family:system-ui,sans-serif;font-size:15px;line-height:1.9">
  <h2 style="margin:0 0 12px">طلب نسخة تجريبية</h2>
  <table cellpadding="6" style="border-collapse:collapse">
    ${lines.map(([k, v]) => `<tr><td style="color:#666">${k}</td><td><b>${escapeHtml(String(v))}</b></td></tr>`).join('')}
  </table>
  <p style="margin-top:16px"><a href="https://wa.me/${row.phone.replace(/\D/g, '')}">فتح محادثة واتساب</a></p>
</div>`,
      text: lines.map(([k, v]) => `${k}: ${v}`).join('\n'),
    },
  })
}

/* The values are typed by a stranger and land inside an HTML mail. Escaped at
   the point of interpolation rather than at the point of input, so a change to
   the form's validation cannot quietly remove the escaping. */
function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[c]!
  ))
}

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig(event)
  const locale = getCookie(event, 'toothpath_locale') === 'en' ? 'en' : 'ar'
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'

  if (overLimit(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: locale === 'en'
        ? 'We have your request — give us a chance to call before sending another.'
        : 'وصلنا طلبك — انطينا مجال نتصل بيك قبل ما ترسل مرّة ثانية.',
    })
  }

  const body = await readBody(event)
  const labName = clip(body?.labName, 120)
  const phone = clip(body?.phone, 20)
  const city = clip(body?.city, 60)
  const note = clip(body?.note, 500)

  const nameBad = nameProblem(labName, 'اسم المعمل', { locale, required: true }, 'the lab name')
  if (nameBad) throw createError({ statusCode: 400, statusMessage: nameBad })

  const phoneBad = phoneProblem(phone, { locale, required: true })
  if (phoneBad) throw createError({ statusCode: 400, statusMessage: phoneBad })

  /* Stored in the one shape that is searchable and dialable. */
  const tidy = isValidPhone(phone) ? normalisePhone(phone) : phone

  const row: Row = {
    at: new Date().toISOString(),
    labName,
    phone: tidy,
    city: city || null,
    note: note || null,
  }

  try {
    if (cfg.demoForwardUrl) {
      await $fetch(cfg.demoForwardUrl, { method: 'POST', body: row })
    }
    else if (cfg.resendApiKey) {
      await email(cfg, row)
    }
    else {
      save(row)
    }
  }
  catch (err) {
    /* Last copy. The host keeps its logs even when the mail provider is down
       and the disk is read-only, so a lead is recoverable by hand rather than
       gone. */
    console.error('[demo] delivery failed — request follows', JSON.stringify(row), err)

    throw createError({
      statusCode: 502,
      statusMessage: locale === 'en'
        ? 'We could not record your request. Please call or message us instead — the number is at the bottom of the page.'
        : 'ما كدرنا نسجّل طلبك. اتصل بينا أو راسلنا واتساب — الرقم بأسفل الصفحة.',
    })
  }

  return { ok: true }
})
