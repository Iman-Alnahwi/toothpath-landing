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
 * If `NUXT_DEMO_FORWARD_URL` is set it is forwarded to the live application and
 * nothing is written here. Otherwise it is appended to `data/requests.jsonl`,
 * which `.gitignore` excludes — those lines are real people's phone numbers and
 * must never reach the repository.
 *
 * A file and not SQLite, deliberately: a landing page collects a handful of
 * leads, and a native dependency is a build step every person who clones this
 * repo has to get working before the site will start. One line of JSON per
 * request is readable with `cat`, and there is nothing to migrate.
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

  if (cfg.demoForwardUrl) {
    await $fetch(cfg.demoForwardUrl, {
      method: 'POST',
      body: { labName, phone: tidy, city: city || null, note: note || null },
    })
    return { ok: true }
  }

  save({
    at: new Date().toISOString(),
    labName,
    phone: tidy,
    city: city || null,
    note: note || null,
  })

  return { ok: true }
})
