<script setup lang="ts">
/**
 * The public landing page — the only screen a person sees before they have an
 * account.
 *
 * ── Structure borrowed, content never ─────────────────────────────────────
 * The section order follows what B2B lab software converts with: hero → the
 * problem named → capability blocks that alternate text and picture → what
 * each role sees → the full list → price → objections → one last ask. That
 * skeleton is public knowledge. Everything inside it is ToothPath's own, and
 * every claim below is a screen that exists in this repository.
 *
 * ── The pictures are the product, not illustrations ───────────────────────
 * Each capability block draws a small, real piece of the app — the pipeline
 * strip from CASE_STAGES_ORDER, the late/on-time split bars, the team-load bar
 * with its amber «held at the clinic» segment, the receivables ageing bar. No
 * stock photography and no invented dashboard: a landing page showing a product
 * that does not look like the product is a lie with a very short life.
 *
 * ── What is deliberately absent ───────────────────────────────────────────
 * No testimonials and no logo wall. There are no customers yet, and in a market
 * where every lab in Baghdad knows the others by name, an invented quote is the
 * fastest way to lose all of them at once.
 *
 * ── Prices ────────────────────────────────────────────────────────────────
 * `/api/plans` prefers the live application's public endpoint (set
 * `NUXT_PUBLIC_PLANS_URL`) and falls back to `config/plans.ts`. The yearly
 * saving is computed from whichever rows come back. A percentage typed into
 * this file would be a promise the price table can quietly stop keeping.
 *
 * ── This file lives in the PUBLIC repository ──────────────────────────────
 * It imports nothing from the application: `shared/` here holds trimmed copies
 * of the eight stage names, the four ageing bands and two validation rules —
 * everything the page draws, and nothing about how the product works. Contact
 * details come from the environment, never from the source.
 */
import { ArrowRight, Check } from '@lucide/vue'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Textarea } from '~/components/ui/textarea'
import { Spinner } from '~/components/ui/spinner'
import { STAGES, roleLabel, stageLabel } from '~~/shared/stages'
import { AGEING_BANDS, bandRange } from '~~/shared/ageing'
import { cityOptions } from '~~/shared/iraq'
import { PHONE_HINT, PHONE_PLACEHOLDER, nameProblem, phoneProblem } from '~~/shared/validation'
import { DAY, countNoun } from '~/utils/arabicCount'

const { t, locale, dir } = useLocale()

/*
  Contact details come from the environment, not from this file.

  They are the one piece of real-world information on an otherwise public page,
  and a phone number committed to a public repository is a phone number in the
  git history forever. See `.env.example`.
*/
const cfg = useRuntimeConfig().public
const CONTACT = computed(() => ({
  phone: cfg.contactPhone,
  whatsapp: cfg.contactWhatsapp,
  email: cfg.contactEmail,
}))
const waLink = computed(() =>
  `https://wa.me/${CONTACT.value.whatsapp}?text=${encodeURIComponent(t('أريد أعرف أكثر عن ToothPath'))}`)

/* No layout: the app chrome is a sidebar full of screens this visitor cannot
   open, and a disabled navigation is worse than none. */
definePageMeta({ layout: false })

/* A COMPUTED head, not a literal one. Both were hard-coded Arabic, so the
   browser tab and the search snippet stayed Arabic on the English site. */
useHead(() => ({
  title: t('ToothPath — نظام إدارة معامل الأسنان'),
  meta: [{
    name: 'description',
    content: t('تتبّع كل حالة من العيادة للتسليم، وزّع الشغل على الفريق تلقائيًا، وشوف شكد عليك ومنو دفع — بنظام واحد عربي لمعامل الأسنان في العراق.'),
  }],
}))

/* The real pipeline, from the enum. `delivered` is the exit, not a station —
   nothing stands in it, and the strip reads «where work stands». */
const stages = computed(() =>
  STAGES.filter(s => s.key !== 'delivered').map(s => stageLabel(s.key, locale.value)))

/*
  ── The mock visuals read the app's own vocabulary ────────────────────────

  Both of these had their labels typed by hand — «وصلت», «التصميم», «ضمن
  المهلة», «0–45 يوم» — and they stayed Arabic on the English site because a
  literal string is not a translation key. Worse, they were a second copy of
  names the app already owns: the day a stage or a band is reworded, the
  landing page would keep advertising the old one.

  `stageLabel` and `AGEING_BANDS` are the same sources the real screens draw.
  The percentages are illustrative; the WORDS are not.
*/
const MINI_STAGES = ['received', 'design', 'milling', 'ceramics', 'ready_for_dispatch'] as const
const MINI_SPLIT: Record<string, { late: number, ok: number }> = {
  received: { late: 12, ok: 0 },
  design: { late: 42, ok: 20 },
  milling: { late: 0, ok: 26 },
  ceramics: { late: 30, ok: 16 },
  ready_for_dispatch: { late: 0, ok: 14 },
}
const miniPipeline = computed(() => MINI_STAGES.map(stage => ({
  stage,
  label: stageLabel(stage, locale.value),
  ...MINI_SPLIT[stage]!,
})))

/* The band names live in AgeingBar.vue, which is the screen this picture is a
   miniature of; the ranges come from AGEING_BANDS so «0–45» cannot drift from
   the rule the server ages debt by. */
const miniAgeing = computed(() => AGEING_BANDS.map(b => ({
  key: b.key,
  c: b.color,
  l: locale.value === 'en' ? b.en : b.ar,
  d: bandRange(b, locale.value),
})))

/* ═══ prices ═══════════════════════════════════════════════════════════════ */
interface Plan { id: number, name: string, durationDays: number, price: number }
const { data: plans } = await useFetch<Plan[]>('/api/plans', { default: () => [] })

const money = (v: number) => v.toLocaleString('en-US')

const paidPlans = computed(() => plans.value.filter(p => p.price > 0))
const trialPlan = computed(() => plans.value.find(p => p.price === 0) ?? null)

function planPeriod(days: number) {
  /* «سنويًا», not «سنة»: the source string IS the i18n key, and «سنة» already
     means «years» on three case screens (patient age). Reusing it here would
     have made one key answer two questions. */
  if (days % 365 === 0) return t('سنويًا')
  if (days % 30 === 0) {
    const months = days / 30
    return months === 1 ? t('شهر') : t('{n} أشهر', { n: months })
  }
  return countNoun(days, DAY, locale.value)
}

/*
  The saving on a longer term, COMPUTED from the rows rather than asserted.

  «وفّر ١٧٪» typed into this file is a promise the price table can quietly stop
  keeping the day somebody edits it in /admin/plans.
*/
function savingPct(p: Plan) {
  const monthly = plans.value.find(x => x.durationDays === 30)
  if (!monthly || p.durationDays <= 30) return 0
  const atMonthlyRate = monthly.price * (p.durationDays / 30)
  if (atMonthlyRate <= 0) return 0
  return Math.round(((atMonthlyRate - p.price) / atMonthlyRate) * 100)
}

/* ═══ the ask ══════════════════════════════════════════════════════════════ */
const form = ref({ labName: '', city: '', phone: '', note: '' })
const sending = ref(false)
const sent = ref(false)
const sendError = ref('')

/* The same two rules the endpoint refuses with — never a second copy. */
const errors = computed(() => ({
  labName: nameProblem(form.value.labName, 'اسم المعمل', { locale: locale.value, required: true }, 'the lab name'),
  phone: phoneProblem(form.value.phone, { locale: locale.value, required: true }),
}))
const gate = useFieldGate(() => errors.value, () => form.value)

async function submit() {
  if (!gate.attempt()) return
  sendError.value = ''
  sending.value = true
  try {
    await $fetch('/api/demo', { method: 'POST', body: form.value })
    sent.value = true
  }
  catch (e: any) {
    /* Inline, not a toast. A message that slides in over the corner of the
       screen and leaves is the wrong place for «your request did not send» —
       it belongs beside the button that failed, and it has to stay there. */
    sendError.value = e?.data?.statusMessage ?? t('ما وصل الطلب — جرّب مرّة ثانية أو اتصل بينا.')
  }
  finally { sending.value = false }
}

function toForm() {
  document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
function toHow() {
  document.getElementById('how')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ═══ content ══════════════════════════════════════════════════════════════ */

/*
  Capability blocks. `visual` names the small real thing drawn beside each —
  see the template. Ordered the way a lab owner's day runs: what is stuck, who
  has it, what the clinic owes me, am I any good at this.
*/
const BLOCKS = [
  {
    eyebrow: 'مسار الشغل',
    title: 'كل حالة واقفة بمرحلة معروفة',
    body: 'ثمان مراحل من الاستلام للتسليم. تفتح الشاشة وتشوف كم حالة بكل مرحلة، وكم منها متأخّر، وأقدم وحدة صار لها كم يوم — بترتيب المسار، مو مرتّبة بالأكثر.',
    chips: ['العدد الآن', 'المتأخّر منه', 'أقدم حالة'],
    visual: 'pipeline',
  },
  {
    eyebrow: 'الفريق',
    title: 'منو ماسك الشغل، ومنو فاضي',
    body: 'حمولة كل فني بدوره — مو الكل بكومة وحدة. والحالة الموقوفة على العيادة تنبيّن بلون ثاني، حتى ما تحسب الفني مشغول بشغل ما يكدر يبديه أصلاً.',
    chips: ['كل دور لحاله', 'موقوفة على العيادة', 'حدّ الإرهاق'],
    visual: 'team',
  },
  {
    eyebrow: 'التوزيع',
    title: 'الحالة تلگى مصمّمها لحالها',
    body: 'النظام يشوف مهارات كل مصمّم وشكد عنده شغل الآن، ويوزّع. ولمّا الحالة تنتقل للتصنيع أو التشطيب، تنتقل معها المسؤولية — ما تبقى معلّقة باسم واحد خلّص شغله.',
    chips: ['حسب المهارة', 'حسب الحمولة', 'تسليم تلقائي بين المراحل'],
    visual: 'assign',
  },
  {
    eyebrow: 'بوابة العيادة',
    title: 'الطبيب يخدم نفسه',
    body: 'يرسل الحالة، يرفع المسح وصور اللون، يوافق على التصميم، ويشوف حسابه — من بوابته. والمعمل ما يستلم حالة ناقصة صور أو مسح، فما يوصل للفني شي ما يكدر يشتغل عليه.',
    chips: ['يرفع المسح والصور', 'يوافق على التصميم', 'يشوف حسابه'],
    visual: 'portal',
  },
  {
    eyebrow: 'المستحقات',
    title: 'شكد عليك، ومنو متأخّر',
    body: 'المستحقات مقسّمة بأعمارها — ضمن المهلة، متأخّر، متأخّر جدًا، متعثّر. والعيادة تُقرّ دفعتها والمعمل يؤكّدها، فما تضيع دفعة بين الدفتر والسائق.',
    chips: ['أعمار المستحقات', 'إقرار وتأكيد', 'كشف لكل عيادة'],
    visual: 'ageing',
  },
  {
    eyebrow: 'الأرقام',
    title: 'أرقام تقدر تقرّر عليها',
    body: 'نسبة التسليم بالموعد شهر بشهر، والشغل المسلَّم مقابل المحصَّل. والنسبة محسوبة على أول تاريخ انطيته للعيادة — يعني تمديد التاريخ ما يحسّن الرقم.',
    chips: ['التسليم بالموعد', 'الشغل مقابل التحصيل', 'متوسط كل مرحلة'],
    visual: 'ontime',
  },
]

/*
  Three promises, not six. This is the «why you» section and it sits above the
  detail — a reader who is not sold by three will not be sold by ten.
*/
const CORE = [
  {
    icon: 'checklist-minimalistic',
    title: 'إدارة الحالات بدقّة',
    body: 'كل حالة تمشي بثمان مراحل معروفة بين العيادة والمعمل، ومسجّل عليها منو شتغل بيها ومتى — سجلّ كامل ما ينحذف.',
  },
  {
    icon: 'users-group-rounded',
    title: 'حساب لكل دور',
    body: 'مالك المعمل، المصمّم، فني التصنيع، فني التشطيب، المندوب، الطبيب ومساعده — كل واحد يفتح على شغله هو فقط.',
  },
  {
    icon: 'wallet-money',
    title: 'حسابات ومدفوعات',
    body: 'كشف لكل عيادة، ومستحقات بأعمارها، والعيادة تُقرّ الحوالة والمعمل يؤكّدها — فما تضيع دفعة ولا تنحسب مرّتين.',
  },
]

/* Three steps. The objection this answers is «هذا كله معقّد». */
/* Western digits, like every other number in this product — see
   shared/types/dates.ts and the arabicCount notes. «١ ٢ ٣» here was wrong in
   BOTH languages, not just English. */
const STEPS = [
  {
    n: '1',
    title: 'افتح حسابك',
    body: 'نفتحلك المعمل، وندخل وياك العيادات والأطباء وقائمة أسعارك. بيوم واحد تكون شغّال.',
  },
  {
    n: '2',
    title: 'الحالة تدخل',
    body: 'الطبيب يرسلها من بوابته بالمسح وصور اللون — أو تدخلها إنت. والنظام يوزّعها على المصمّم المناسب.',
  },
  {
    n: '3',
    title: 'تابع للتسليم',
    body: 'تشوف كل حالة وين واقفة، والمندوب يسجّل التوصيل، والحساب ينحدّث لحاله.',
  },
]

/*
  The eight roles, by name. Asked for explicitly, and it is the answer to «هل
  كل واحد بالمعمل راح يشوف كلشي؟» — which is the question behind it.
*/
const ROLE_CARDS = [
  { r: 'صاحب المعمل', s: 'كلشي: المتأخّر، الفريق، الحسابات، التقارير' },
  { r: 'المصمّم', s: 'حالاته هو، بمهاراته، بلا أي رقم فلوس' },
  { r: 'فني التصنيع', s: 'اللي واقف بمرحلة التصنيع فقط' },
  { r: 'فني التشطيب', s: 'اللي واقف بالتشطيب، مع اللون والملاحظات' },
  { r: 'المندوب', s: 'الجاهز للتوصيل، مع عنوان العيادة ورقمها' },
  { r: 'الطبيب', s: 'حالاته هو، وحسابه مع كل معمل' },
  { r: 'مساعد الطبيب', s: 'نفس بوابة الطبيب — يرفع ويتابع بدله' },
  { r: 'مدير النظام', s: 'المعامل والاشتراكات — بلا دخول على بيانات أي معمل' },
]

/* The «from anywhere» block. NOT a mobile app: this project has no iOS or
   Android build and claiming one would be found out on the first call. What is
   true is better for this market anyway — nothing to install on a cheap
   Android, and no app store account. */
const ANYWHERE = [
  'الفني يحدّث الحالة من على الطاولة، بتلفونه',
  'المندوب يسجّل التوصيل من باب العيادة',
  'الطبيب يرفع صور اللون من كرسي المريض',
  'وإنت تشوف اللوحة من أي مكان',
]

const INCLUDED = [
  'تتبّع الحالة بثمان مراحل',
  'توزيع تلقائي حسب المهارة والحمولة',
  'بوابة للعيادات والأطباء',
  'رفع المسح وصور مطابقة اللون',
  'موافقة الطبيب على التصميم',
  'قائمة أسعار لكل نوع عمل',
  'تسعير بالسنّ أو بالفكّ',
  'الحالات العاجلة والمتأخّرة',
  'تمديد التسليم بسبب مسجّل',
  'حسابات العيادات وأعمار المستحقات',
  'إقرار الدفع وتأكيده',
  'تقرير التسليم بالموعد',
  'الشغل مقابل التحصيل',
  'متوسط الوقت لكل مرحلة',
  'حمولة كل فني',
  'تتبّع أقراص الزركون واللوت',
  'سجلّ كامل لكل حالة',
  'عربي وإنكليزي',
]

const FAQ = [
  {
    q: 'نحتاج نغيّر طريقة شغلنا؟',
    a: 'لا. المراحل الثمان هي نفس المسار اللي تشتغلون بيه أصلاً — استلام، تصميم، موافقة، تصنيع، تشطيب، تجهيز، توصيل، تسليم. النظام يوثّقه، ما يبدّله.',
  },
  {
    q: 'الفنيين ما يعرفون يستعملون برامج',
    a: 'الفني يشوف شاشة وحدة: طابور حالاته. بلا أرقام فلوس وبلا إعدادات وبلا قوائم. أغلب شغله ضغطة وحدة: «خلّصت».',
  },
  {
    q: 'شنو يصير لبياناتنا القديمة؟',
    a: 'نساعدكم تدخلون العيادات والأطباء وقائمة الأسعار وقت التجربة. الحالات القديمة المسلَّمة ما نحتاجها — نبدي من الشغل اللي على الطاولة.',
  },
  {
    q: 'الأطباء لازم يستعملون النظام؟',
    a: 'مو شرط. تكدر تدخل حالاتهم إنت مثل ما تسوّي هسّه، وتنطي حساب للطبيب اللي يريد. اللي ياخذ حساب يوفّر عليك مكالمات.',
  },
  {
    q: 'الاشتراك على عدد المستخدمين؟',
    a: 'لا. سعر واحد للمعمل كله — تضيف كل فنيينك وكل عياداتك بلا فرق بالسعر.',
  },
  {
    q: 'شنو يصير بعد ما تنتهي التجربة؟',
    a: 'بياناتك تبقى مكانها. تكمل باشتراك، أو توقف — وإذا رجعت، ترجع على نفس المعمل مو على نظام فاضي.',
  },
]
</script>

<template>
  <div :dir="dir" class="min-h-dvh bg-white text-foreground antialiased">
    <!-- ═══ header ═══════════════════════════════════════════════════════ -->
    <header class="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <img src="/brand/logo.svg" alt="ToothPath" class="h-9 w-auto">
        <div class="flex items-center gap-1.5 sm:gap-2">
          <LocaleSwitch />
          <Button as-child variant="ghost" size="sm">
            <NuxtLink to="/login">{{ t('تسجيل الدخول') }}</NuxtLink>
          </Button>
          <Button size="sm" class="hidden sm:inline-flex" @click="toForm">{{ t('اطلب عرضًا') }}</Button>
        </div>
      </div>
    </header>

    <!-- ═══ 1 · hero ═════════════════════════════════════════════════════ -->
    <!--
      One promise in the words a lab owner uses. Not «منصّة متكاملة لإدارة سير
      العمل» — that sentence fits every piece of software ever written and tells
      a dental lab nothing about its own Tuesday.
    -->
    <section class="relative overflow-hidden border-b border-border">
      <!-- A wash, not a picture: colour that does not compete with the words. -->
      <div
        class="pointer-events-none absolute inset-x-0 -top-40 h-[26rem] opacity-70"
        :style="{ background: 'radial-gradient(60% 60% at 50% 50%, var(--brand-green-tint) 0%, transparent 70%)' }"
      />

      <div class="relative mx-auto max-w-6xl px-5 pb-16 pt-16 text-center sm:pb-20 sm:pt-24">
        <p class="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--brand-green-soft)]
                  bg-white px-3.5 py-1.5 text-[0.78rem] font-semibold text-[var(--brand-green-dark)]">
          <span class="size-1.5 rounded-full bg-[var(--brand-green)]" />
          {{ t('لمعامل الأسنان في العراق') }}
        </p>

        <h1 class="mx-auto max-w-3xl text-[2rem] font-black leading-[1.2] tracking-tight sm:text-[3.25rem] sm:leading-[1.12]">
          {{ t('اربط معملك بعياداتك') }}
          <span class="text-[var(--brand-green)]">{{ t('— وتابع كل حالة للتسليم') }}</span>
        </h1>

        <p class="mx-auto mt-6 max-w-2xl text-[1.02rem] leading-[1.85] text-muted-foreground sm:text-[1.1rem]">
          {{ t('نظام واحد لإدارة الحالات، وتوزيع الشغل على الفريق، ومتابعة الحسابات — بين معامل الأسنان وعياداتها في العراق.') }}
        </p>

        <div class="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" class="h-12 px-8 text-[0.95rem] shadow-sm" @click="toForm">
            {{ t('اطلب نسختك التجريبية') }}
            <!-- `ArrowRight` + `rtl:rotate-180`, the pattern already used on
                 /owner and /admin/subscriptions: → in LTR, ← in RTL, so the
                 arrow always leaves toward the end of the line. It was
                 `ArrowLeft` with the same rotation, which is backwards in BOTH
                 directions — ← in English and → in Arabic. -->
            <ArrowRight class="size-4 rtl:rotate-180" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            class="h-12 px-8 text-[0.95rem]"
            @click="toHow"
          >{{ t('شوف شلون يشتغل') }}</Button>
        </div>

        <!-- The two objections that stop a lab owner pressing, answered before
             they are raised. -->
        <p v-if="trialPlan" class="mt-4 text-[0.82rem] text-muted-foreground">
          {{ t('تجربة {n} — بلا بطاقة ائتمان، وبلا التزام.', { n: countNoun(trialPlan.durationDays, DAY, locale) }) }}
        </p>

        <!--
          The hero image IS the pipeline, and it is read from CASE_STAGES_ORDER.
          A screenshot ages the day a screen changes; this cannot show a flow
          the software does not have.
        -->
        <div class="mx-auto mt-14 max-w-4xl">
          <div class="rounded-2xl border border-border bg-white p-3 shadow-[0_1px_3px_rgba(16,24,40,.06),0_12px_40px_-12px_rgba(16,24,40,.14)]">
            <div class="overflow-x-auto rounded-xl bg-secondary/50 p-3">
              <ol class="flex w-max items-center gap-1.5 sm:mx-auto sm:gap-2">
                <li v-for="(s, i) in stages" :key="s" class="flex items-center gap-1.5 sm:gap-2">
                  <span
                    class="whitespace-nowrap rounded-lg bg-white px-3 py-2 text-[0.78rem] font-semibold shadow-sm"
                    :class="i === 0 && 'ring-1 ring-[var(--brand-green-soft)]'"
                  >{{ s }}</span>
                  <!-- Same rule as the CTA above: the arrow points the way the
                       process runs, which in RTL is leftward. -->
                  <ArrowRight
                    v-if="i < stages.length - 1"
                    class="size-3.5 shrink-0 text-muted-foreground/40 rtl:rotate-180"
                  />
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ 2 · the problem ══════════════════════════════════════════════ -->
    <!--
      Named before the cure, and named in the lab's own words. An owner who does
      not recognise their own Tuesday in this paragraph will not read the next.
    -->
    <section class="bg-secondary/30 py-16 sm:py-20">
      <div class="mx-auto max-w-5xl px-5">
        <h2 class="text-center text-[1.6rem] font-bold sm:text-[2rem]">{{ t('تعرف هالوضع؟') }}</h2>
        <ul class="mt-9 grid gap-3 sm:grid-cols-2">
          <li
            v-for="p in [
              'الدكتور يتصل يسأل عن حالته، وتدور بالدفتر',
              'حالة تنسى بالرف أسبوع وما أحد انتبه',
              'مصمّم مخنوق بالشغل وواحد فاضي',
              'ما تعرف شكد على كل عيادة إلا آخر الشهر',
            ]"
            :key="p"
            class="flex items-start gap-3 rounded-xl border border-border bg-white px-4 py-3.5
                   text-[0.92rem] leading-relaxed"
          >
            <span class="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-[var(--state-late-bg)]" />
            {{ t(p) }}
          </li>
        </ul>
      </div>
    </section>

    <!-- ═══ 2b · the three promises ══════════════════════════════════════ -->
    <!--
      Three, not six. This is «why you», and it sits above the detail: a reader
      who is not sold by three will not be sold by ten.
    -->
    <section class="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div class="grid gap-8 md:grid-cols-3">
        <div v-for="c in CORE" :key="c.title" class="text-center md:text-start">
          <span class="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl
                       bg-[var(--brand-green-tint)] text-[var(--brand-green-dark)] md:mx-0">
            <SolarIcon :name="c.icon" weight="bold" class="size-6" />
          </span>
          <h3 class="text-[1.05rem] font-bold">{{ t(c.title) }}</h3>
          <p class="mt-2 text-[0.9rem] leading-[1.85] text-muted-foreground">{{ t(c.body) }}</p>
        </div>
      </div>
    </section>

    <!-- ═══ 2c · how it works ════════════════════════════════════════════ -->
    <!--
      Three steps, because the objection this answers is «هذا كله معقّد». The
      connector is drawn only from `md` up, where the three sit in a row.
    -->
    <section id="how" class="scroll-mt-20 border-y border-border bg-secondary/30 py-16 sm:py-20">
      <div class="mx-auto max-w-5xl px-5">
        <h2 class="text-center text-[1.6rem] font-bold sm:text-[2rem]">{{ t('شلون يشتغل؟') }}</h2>
        <p class="mx-auto mt-3 max-w-lg text-center text-[0.92rem] leading-relaxed text-muted-foreground">
          {{ t('ثلاث خطوات، وأول وحدة نسوّيها وياك.') }}
        </p>

        <ol class="relative mt-11 grid gap-8 md:grid-cols-3 md:gap-6">
          <!-- One line behind the three numbers. `inset-inline` so it runs the
               right way in both directions without a second rule. -->
          <span class="pointer-events-none absolute inset-inline-start-[12%] top-6 hidden h-px
                       w-[76%] bg-border md:block" />
          <li v-for="st in STEPS" :key="st.n" class="relative text-center">
            <span class="mx-auto mb-4 flex size-12 items-center justify-center rounded-full
                         border border-[var(--brand-green-soft)] bg-white text-lg font-black
                         text-[var(--brand-green-dark)]">{{ st.n }}</span>
            <h3 class="text-[1.02rem] font-bold">{{ t(st.title) }}</h3>
            <p class="mx-auto mt-2 max-w-xs text-[0.88rem] leading-[1.85] text-muted-foreground">
              {{ t(st.body) }}
            </p>
          </li>
        </ol>
      </div>
    </section>

    <!-- ═══ 3 · capability blocks ════════════════════════════════════════ -->
    <!--
      Alternating text and picture, and every picture is a real piece of the
      app rebuilt small. `lg:[direction:rtl]` is not used — the order flips with
      grid `order`, which keeps the text direction alone.
    -->
    <section class="mx-auto max-w-6xl px-5 py-16 sm:py-24">
      <div class="mb-14 text-center">
        <p class="mb-2 text-[0.78rem] font-bold tracking-wide text-[var(--brand-green-dark)]">
          {{ t('شنو يسوّي ToothPath') }}
        </p>
        <h2 class="mx-auto max-w-2xl text-[1.6rem] font-bold leading-snug sm:text-[2rem]">
          {{ t('كل شي يحتاجه المعمل، بشاشة يفهمها من أول نظرة') }}
        </h2>
      </div>

      <div class="flex flex-col gap-16 sm:gap-24">
        <div
          v-for="(b, i) in BLOCKS"
          :key="b.title"
          class="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
        >
          <!-- text -->
          <div :class="i % 2 === 1 && 'lg:order-2'">
            <p class="mb-2.5 text-[0.75rem] font-bold tracking-wide text-[var(--brand-green-dark)]">
              {{ t(b.eyebrow) }}
            </p>
            <h3 class="text-[1.35rem] font-bold leading-snug sm:text-[1.6rem]">{{ t(b.title) }}</h3>
            <p class="mt-3.5 text-[0.95rem] leading-[1.9] text-muted-foreground">{{ t(b.body) }}</p>
            <ul class="mt-5 flex flex-wrap gap-2">
              <li
                v-for="c in b.chips"
                :key="c"
                class="rounded-full border border-border bg-secondary/60 px-3 py-1 text-[0.76rem] font-semibold"
              >{{ t(c) }}</li>
            </ul>
          </div>

          <!-- picture: a real fragment of the product -->
          <div
            class="rounded-2xl border border-border bg-white p-4 shadow-[0_1px_3px_rgba(16,24,40,.05),0_16px_44px_-16px_rgba(16,24,40,.16)] sm:p-5"
            :class="i % 2 === 1 && 'lg:order-1'"
          >
            <!-- ── cases per stage, late split ── -->
            <template v-if="b.visual === 'pipeline'">
              <p class="mb-3 text-[0.78rem] font-bold">{{ t('الحالات في كل مرحلة') }}</p>
              <ul class="space-y-2">
                <li
                  v-for="r in miniPipeline"
                  :key="r.stage"
                  class="grid grid-cols-[5.5rem_1fr] items-center gap-3"
                >
                  <span class="truncate text-[0.76rem] font-semibold">{{ r.label }}</span>
                  <span class="relative flex h-4 w-full overflow-hidden rounded-md bg-muted">
                    <span class="h-full bg-[var(--state-late-bg)]" :style="{ width: `${r.late}%` }" />
                    <span class="h-full bg-[var(--brand-green-soft)]" :style="{ width: `${r.ok}%` }" />
                  </span>
                </li>
              </ul>
              <p class="mt-3 flex flex-wrap gap-x-4 text-[0.7rem] text-muted-foreground">
                <span class="flex items-center gap-1.5">
                  <span class="size-2.5 rounded-[3px] bg-[var(--state-late-bg)]" />{{ t('متأخّرة') }}
                </span>
                <span class="flex items-center gap-1.5">
                  <span class="size-2.5 rounded-[3px] bg-[var(--brand-green-soft)]" />{{ t('ضمن موعدها') }}
                </span>
              </p>
            </template>

            <!-- ── who is holding the work ── -->
            <template v-else-if="b.visual === 'team'">
              <p class="mb-3 text-[0.78rem] font-bold">{{ t('منو ماسك الشغل') }}</p>
              <div class="space-y-3.5">
                <div v-for="g in [
                  { role: roleLabel('cad_designer', locale), people: [{ n: t('طلال'), ok: 66, held: 22 }, { n: t('فاطمة'), ok: 18, held: 0 }] },
                  { role: roleLabel('ceramist', locale), people: [{ n: t('حيدر'), ok: 54, held: 0 }] },
                ]" :key="g.role">
                  <p class="mb-1.5 text-[0.7rem] font-semibold text-muted-foreground">{{ g.role }}</p>
                  <ul class="space-y-1.5">
                    <li
                      v-for="p in g.people"
                      :key="p.n"
                      class="grid grid-cols-[4rem_1fr] items-center gap-3"
                    >
                      <span class="truncate text-[0.76rem] font-semibold">{{ p.n }}</span>
                      <span class="relative flex h-4 w-full overflow-hidden rounded-md bg-muted">
                        <span class="h-full bg-[var(--brand-green-soft)]" :style="{ width: `${p.ok}%` }" />
                        <span v-if="p.held" class="h-full bg-[var(--state-waiting-accent)]" :style="{ width: `${p.held}%` }" />
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              <p class="mt-3 flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                <span class="size-2.5 shrink-0 rounded-[3px] bg-[var(--state-waiting-accent)]" />
                {{ t('موقوفة على العيادة') }}
              </p>
            </template>

            <!-- ── routing ── -->
            <template v-else-if="b.visual === 'assign'">
              <p class="mb-3 text-[0.78rem] font-bold">{{ t('الحالة الجديدة') }}</p>
              <div class="space-y-2">
                <div
                  v-for="(d, k) in [
                    { n: t('طلال الأشراف'), tags: ['زرعة', 'جسر'], load: 'مشغول', pick: false },
                    { n: t('فاطمة الخليفي'), tags: ['زرعة', 'قشرة'], load: 'عنده مجال', pick: true },
                  ]"
                  :key="d.n"
                  class="flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5"
                  :class="d.pick
                    ? 'border-[var(--brand-green-soft)] bg-[var(--brand-green-tint)]/60'
                    : 'border-border'"
                >
                  <span class="min-w-0">
                    <span class="block truncate text-[0.8rem] font-semibold">{{ d.n }}</span>
                    <span class="mt-0.5 flex flex-wrap gap-1">
                      <span
                        v-for="g in d.tags"
                        :key="g"
                        class="rounded-full bg-secondary px-1.5 py-0.5 text-[0.65rem] font-semibold text-muted-foreground"
                      >{{ t(g) }}</span>
                    </span>
                  </span>
                  <span class="shrink-0 text-[0.7rem] font-semibold"
                        :class="d.pick ? 'text-[var(--brand-green-dark)]' : 'text-muted-foreground'">
                    {{ d.pick ? t('اختيرت') : t(d.load) }}
                  </span>
                </div>
              </div>
              <p class="mt-3 text-[0.7rem] leading-relaxed text-muted-foreground">
                {{ t('نفس القاعدة اللي يشوفها المالك هي اللي يشتغل بيها التوزيع.') }}
              </p>
            </template>

            <!-- ── clinic portal ── -->
            <template v-else-if="b.visual === 'portal'">
              <p class="mb-3 text-[0.78rem] font-bold">{{ t('حالة عند الطبيب') }}</p>
              <ol class="space-y-2">
                <li
                  v-for="s in [
                    { l: 'أرسل الحالة', done: true },
                    { l: 'رفع ملف المسح', done: true },
                    { l: 'رفع صور اللون', done: true },
                    { l: 'وافق على التصميم', done: false },
                  ]"
                  :key="s.l"
                  class="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.8rem]"
                  :class="s.done ? 'bg-[var(--state-ready-bg)]/50' : 'bg-[var(--state-waiting-bg)]'"
                >
                  <span
                    class="flex size-5 shrink-0 items-center justify-center rounded-full"
                    :class="s.done
                      ? 'bg-[var(--brand-green)] text-white'
                      : 'border border-[var(--state-waiting-line)] bg-white'"
                  >
                    <Check v-if="s.done" class="size-3" />
                  </span>
                  <span :class="!s.done && 'font-semibold text-[var(--state-waiting-ink)]'">{{ t(s.l) }}</span>
                </li>
              </ol>
            </template>

            <!-- ── receivables ageing ── -->
            <template v-else-if="b.visual === 'ageing'">
              <p class="mb-1 text-[0.78rem] font-bold">{{ t('أعمار المستحقات') }}</p>
              <p class="mb-3 text-[0.7rem] text-muted-foreground">{{ t('العمر محسوب من يوم تسليم الحالة') }}</p>
              <div class="mb-3 flex h-5 w-full overflow-hidden rounded-md">
                <span class="h-full bg-[#96231E]" style="width:8%" />
                <span class="h-full bg-[#D2542F]" style="width:18%" />
                <span class="h-full bg-[#E8A33D]" style="width:15%" />
                <span class="h-full bg-[#159847]" style="width:59%" />
              </div>
              <ul class="space-y-1.5 text-[0.76rem]">
                <li
                  v-for="b2 in miniAgeing"
                  :key="b2.key"
                  class="flex items-center gap-2"
                >
                  <span class="size-2.5 shrink-0 rounded-[3px]" :style="{ background: b2.c }" />
                  <span class="font-semibold">{{ b2.l }}</span>
                  <span class="text-muted-foreground">{{ b2.d }}</span>
                </li>
              </ul>
            </template>

            <!-- ── on-time trend ── -->
            <template v-else>
              <div class="mb-3 flex items-baseline gap-2">
                <span class="text-2xl font-black leading-none" dir="ltr">71%</span>
                <span class="text-[0.78rem] font-semibold text-muted-foreground">{{ t('سُلّمت بموعدها') }}</span>
              </div>
              <!-- A sparkline of the real shape that data takes: volatile, and
                   the last month still running. -->
              <svg viewBox="0 0 300 90" class="w-full" preserveAspectRatio="none" aria-hidden="true">
                <g stroke="var(--border)" stroke-width="1">
                  <line x1="0" y1="10" x2="300" y2="10" /><line x1="0" y1="40" x2="300" y2="40" />
                  <line x1="0" y1="70" x2="300" y2="70" />
                </g>
                <polyline
                  points="10,10 45,55 80,10 115,52 150,29 185,42 220,29 255,38 275,25"
                  fill="none" stroke="var(--brand-green-dark)" stroke-width="2.5"
                  stroke-linejoin="round" stroke-linecap="round"
                />
                <polyline
                  points="275,25 295,50" fill="none" stroke="var(--brand-green-dark)"
                  stroke-width="2.5" stroke-dasharray="4 4" stroke-linecap="round"
                />
              </svg>
              <p class="mt-2 text-[0.7rem] text-muted-foreground">
                {{ t('الخط المتقطّع = الشهر الحالي، لسّه ماشي.') }}
              </p>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ 4 · a login per role ═════════════════════════════════════════ -->
    <!--
      Eight roles by name. The objection behind this section is «راح يشوفون كل
      شي؟» — and the answer is a list, not a reassurance.
    -->
    <section class="border-y border-border bg-secondary/30 py-16 sm:py-20">
      <div class="mx-auto max-w-6xl px-5">
        <p class="mb-2 text-center text-[0.78rem] font-bold tracking-wide text-[var(--brand-green-dark)]">
          {{ t('تعدّد الأدوار') }}
        </p>
        <h2 class="text-center text-[1.6rem] font-bold sm:text-[2rem]">{{ t('حساب لكل واحد، وشاشة تخصّه') }}</h2>
        <p class="mx-auto mt-3 max-w-xl text-center text-[0.92rem] leading-relaxed text-muted-foreground">
          {{ t('الصلاحيات محسومة بالخادم مو بالواجهة — الفني ما يشوف سعرًا حتى لو دوّر عليه.') }}
        </p>

        <ul class="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <li
            v-for="r in ROLE_CARDS"
            :key="r.r"
            class="rounded-xl border border-border bg-white px-4 py-3.5"
          >
            <p class="text-[0.88rem] font-bold">{{ t(r.r) }}</p>
            <p class="mt-1 text-[0.8rem] leading-relaxed text-muted-foreground">{{ t(r.s) }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- ═══ 4b · from anywhere ═══════════════════════════════════════════ -->
    <!--
      The «mobile» pitch, told truthfully. There is NO iOS or Android build in
      this project, and claiming one is found out on the first call. What is
      true reads better for this market anyway: nothing to install on a cheap
      Android, no app store account, and it works on the phone already in the
      technician's pocket.
    -->
    <section class="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <div class="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p class="mb-2.5 text-[0.75rem] font-bold tracking-wide text-[var(--brand-green-dark)]">
            {{ t('من أي مكان') }}
          </p>
          <h2 class="text-[1.5rem] font-bold leading-snug sm:text-[1.9rem]">
            {{ t('معملك بجيبك — بلا ما تنزّل أي تطبيق') }}
          </h2>
          <p class="mt-4 text-[0.95rem] leading-[1.9] text-muted-foreground">
            {{ t('النظام يفتح بمتصفّح التلفون مثل ما يفتح بالحاسبة. ما أكو تطبيق تنزّله، ولا حساب متجر، ولا مساحة تاخذها من تلفون الفني — يفتح الرابط ويشتغل.') }}
          </p>
          <ul class="mt-6 space-y-3">
            <li v-for="a in ANYWHERE" :key="a" class="flex items-start gap-3">
              <span class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full
                           bg-[var(--brand-green-tint)]">
                <Check class="size-3 text-[var(--brand-green-dark)]" />
              </span>
              <span class="text-[0.9rem] leading-relaxed">{{ t(a) }}</span>
            </li>
          </ul>
        </div>

        <!-- A phone-shaped frame around the real queue a technician sees. -->
        <div class="flex justify-center">
          <div class="w-[16rem] rounded-[2rem] border-[6px] border-foreground/85 bg-white p-3 shadow-2xl">
            <div class="mx-auto mb-3 h-1 w-10 rounded-full bg-foreground/20" />
            <p class="mb-2 text-[0.72rem] font-bold">{{ t('مهامي') }}</p>
            <div class="space-y-1.5">
              <div
                v-for="c in [
                  { no: '2026-00153', w: 'Veneer', urgent: true },
                  { no: '2026-00151', w: 'Crown', urgent: false },
                  { no: '2026-00148', w: 'Bridge', urgent: false },
                ]"
                :key="c.no"
                class="rounded-lg border border-border px-2.5 py-2"
              >
                <div class="flex items-center justify-between gap-2">
                  <span class="text-[0.72rem] font-bold" dir="ltr">{{ c.no }}</span>
                  <span
                    v-if="c.urgent"
                    class="rounded-full bg-[var(--state-urgent-bg)] px-1.5 py-0.5
                           text-[0.6rem] font-bold text-[var(--state-urgent-ink)]"
                  >{{ t('عاجلة') }}</span>
                </div>
                <p class="mt-0.5 text-[0.68rem] text-muted-foreground" dir="ltr">{{ c.w }}</p>
              </div>
            </div>
            <div class="mt-3 rounded-lg bg-[var(--brand-green)] py-2 text-center
                        text-[0.72rem] font-bold text-white">{{ t('خلّصت') }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ 4c · standing behind it ══════════════════════════════════════ -->
    <!--
      ── Why there are no testimonials here ────────────────────────────────

      This section was asked for as «آراء العملاء», and it deliberately carries
      none. ToothPath has no customers yet, and in a market where every lab in
      Baghdad knows the others by name, an invented quote from «أحمد، صاحب
      معمل» is not marketing — it is the fastest way to lose the whole market
      at once, and it only has to be caught once.

      What is here instead is true and, for a first customer, more persuasive:
      what the system already is, and what being early actually buys them.
      When there are real labs, their logos go in the strip below and this note
      can go.
    -->
    <section class="border-y border-border bg-secondary/30 py-16 sm:py-20">
      <div class="mx-auto max-w-5xl px-5">
        <h2 class="text-center text-[1.6rem] font-bold sm:text-[2rem]">{{ t('نظام مبني على شغل معمل حقيقي') }}</h2>
        <p class="mx-auto mt-3 max-w-2xl text-center text-[0.92rem] leading-[1.85] text-muted-foreground">
          {{ t('مو قالب جاهز مترجَم. كل مرحلة وكل شاشة انبنت على مسار شغل معمل أسنان عراقي — من استلام الحالة لين تسليمها بيد الطبيب.') }}
        </p>

        <dl class="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-6 text-center md:grid-cols-4">
          <div v-for="f in [
            { n: '8', l: 'مراحل للحالة' },
            { n: '8', l: 'أدوار بصلاحيات' },
            { n: '25', l: 'شاشة جاهزة' },
            { n: '100%', l: 'عربي وإنكليزي' },
          ]" :key="f.l">
            <dt class="text-[2rem] font-black leading-none text-[var(--brand-green-dark)]">{{ f.n }}</dt>
            <dd class="mt-1.5 text-[0.82rem] text-muted-foreground">{{ t(f.l) }}</dd>
          </div>
        </dl>

        <!-- Honest, and it is an offer rather than an apology. -->
        <div class="mx-auto mt-10 max-w-2xl rounded-2xl border border-[var(--brand-green-soft)]
                    bg-white px-6 py-5 text-center">
          <p class="text-[0.9rem] font-bold">{{ t('إحنا جداد، وهذا بصالحك') }}</p>
          <p class="mt-2 text-[0.88rem] leading-[1.85] text-muted-foreground">
            {{ t('المعامل الأولى تشتغل وياي مباشرة: أي شي ناقص أو ما يناسب شغلكم نعدّله. وأسعار البداية تثبت لكم.') }}
          </p>
        </div>
      </div>
    </section>

    <!-- ═══ 5 · everything included ══════════════════════════════════════ -->
    <section class="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <h2 class="text-center text-[1.6rem] font-bold sm:text-[2rem]">
        {{ t('{n} شي داخل بالاشتراك', { n: INCLUDED.length }) }}
      </h2>
      <p class="mt-3 text-center text-[0.92rem] text-muted-foreground">
        {{ t('كلها بكل خطة — ما أكو مزايا محجوبة على باقة أغلى.') }}
      </p>
      <ul class="mx-auto mt-9 grid max-w-4xl gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
        <li
          v-for="f in INCLUDED"
          :key="f"
          class="flex items-start gap-2 text-[0.86rem] leading-relaxed"
        >
          <Check class="mt-1 size-3.5 shrink-0 text-[var(--brand-green)]" />{{ t(f) }}
        </li>
      </ul>
    </section>

    <!-- ═══ 6 · price ════════════════════════════════════════════════════ -->
    <section v-if="plans.length" class="border-t border-border bg-secondary/30 py-16 sm:py-20">
      <div class="mx-auto max-w-6xl px-5">
        <h2 class="text-center text-[1.6rem] font-bold sm:text-[2rem]">{{ t('الاشتراك') }}</h2>
        <p class="mx-auto mt-3 max-w-xl text-center text-[0.92rem] leading-relaxed text-muted-foreground">
          {{ t('سعر واحد للمعمل كله — بلا حساب على عدد المستخدمين أو الحالات.') }}
        </p>

        <!-- The trial, given its own card rather than a fourth column. It is
             not a cheaper plan, it is how you start. -->
        <div
          v-if="trialPlan"
          class="mx-auto mt-9 flex max-w-2xl flex-wrap items-center justify-between gap-4
                 rounded-2xl border border-[var(--brand-green-soft)] bg-white p-5"
        >
          <div>
            <p class="text-[0.78rem] font-bold text-[var(--brand-green-dark)]">{{ t('ابدأ من هنا') }}</p>
            <p class="mt-1 text-lg font-bold">
              {{ t('{n} تجربة كاملة، مجّانًا', { n: countNoun(trialPlan.durationDays, DAY, locale) }) }}
            </p>
            <p class="mt-1 text-[0.82rem] text-muted-foreground">
              {{ t('على بيانات معملك، وبلا بطاقة ائتمان.') }}
            </p>
          </div>
          <Button class="shrink-0" @click="toForm">{{ t('اطلب عرضًا') }}</Button>
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-3">
          <!--
            Read from `plans`. /admin/plans is the only place a price is edited,
            and the saving below is arithmetic on those same rows.
          -->
          <div
            v-for="p in paidPlans"
            :key="p.id"
            class="relative rounded-2xl border bg-white p-6"
            :class="savingPct(p) >= 15
              ? 'border-[var(--brand-green)] shadow-[0_12px_36px_-14px_rgba(21,152,71,.35)]'
              : 'border-border'"
          >
            <span
              v-if="savingPct(p) > 0"
              class="absolute -top-2.5 rounded-full bg-[var(--brand-green)] px-2.5 py-0.5
                     text-[0.68rem] font-bold text-white"
              :style="{ [dir === 'rtl' ? 'right' : 'left']: '1.5rem' }"
            >
              <!-- The «%» must ride with its number: as a bidi-neutral
                   character after an Arabic word it resolved to the other end
                   and rendered «وفّر %11». -->
              {{ t('وفّر') }} <bdi dir="ltr">{{ savingPct(p) }}%</bdi>
            </span>

            <h3 class="font-bold">{{ p.name }}</h3>
            <p class="mt-3 text-[1.9rem] font-black leading-none">
              <bdi dir="ltr">{{ money(p.price) }}</bdi>
              <span class="text-[0.72rem] font-semibold text-muted-foreground">&nbsp;{{ t('unit.currency') }}</span>
            </p>
            <p class="mt-1.5 text-[0.8rem] text-muted-foreground">/ {{ planPeriod(p.durationDays) }}</p>
            <Button variant="outline" class="mt-5 w-full" @click="toForm">{{ t('اطلب عرضًا') }}</Button>
          </div>
        </div>

        <!-- Only claims that are true of this system today. -->
        <ul class="mx-auto mt-8 flex max-w-3xl flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <li
            v-for="t2 in ['بلا بطاقة ائتمان', 'بياناتك تبقى لك', 'تدريب ودعم بالعربي', 'بلا عقد ولا ارتباط']"
            :key="t2"
            class="flex items-center gap-1.5 text-[0.82rem] text-muted-foreground"
          >
            <Check class="size-3.5 shrink-0 text-[var(--brand-green)]" />{{ t(t2) }}
          </li>
        </ul>
      </div>
    </section>

    <!-- ═══ 7 · objections ═══════════════════════════════════════════════ -->
    <!--
      The real ones, in the words they are said in — «الفنيين ما يعرفون
      يستعملون برامج» is the sentence that kills this sale, so it is on the
      page rather than waiting for the call.
    -->
    <section class="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <h2 class="text-center text-[1.6rem] font-bold sm:text-[2rem]">{{ t('أسئلة تنسأل دائمًا') }}</h2>
      <div class="mt-9 divide-y divide-border rounded-2xl border border-border bg-white">
        <details v-for="f in FAQ" :key="f.q" class="group px-5">
          <summary
            class="flex cursor-pointer list-none items-center justify-between gap-4 py-4
                   text-[0.95rem] font-semibold [&::-webkit-details-marker]:hidden"
          >
            {{ t(f.q) }}
            <span class="shrink-0 text-muted-foreground transition-transform group-open:rotate-45">+</span>
          </summary>
          <p class="pb-4 text-[0.88rem] leading-[1.9] text-muted-foreground">{{ t(f.a) }}</p>
        </details>
      </div>
    </section>

    <!-- ═══ 8 · the ask ══════════════════════════════════════════════════ -->
    <section id="demo" class="scroll-mt-20 border-t border-border bg-secondary/30 py-16 sm:py-20">
      <div class="mx-auto max-w-xl px-5">
        <template v-if="!sent">
          <h2 class="text-center text-[1.6rem] font-bold sm:text-[2rem]">{{ t('خلّينا نوريك النظام') }}</h2>
          <p class="mt-3 text-center text-[0.92rem] leading-relaxed text-muted-foreground">
            {{ t('اترك اسم معملك ورقمك، ونتصل بيك ونشغّلك على بياناتك — بلا التزام.') }}
          </p>

          <!--
            Three fields, one of them optional. Every extra box on a public form
            is a share of the people who came to ask and left instead — and all
            it takes to have the conversation is a name and a number.
          -->
          <div class="mt-8 grid gap-3.5 rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div>
              <label for="lp-lab" class="mb-1.5 block text-sm font-semibold">{{ t('اسم المعمل') }}</label>
              <Input
                id="lp-lab"
                v-model="form.labName"
                class="h-11"
                :aria-invalid="gate.show('labName')"
                :placeholder="t('مثال: معمل النور')"
                @blur="gate.touch('labName')"
              />
              <InputNote :show="gate.show('labName')" :message="errors.labName" />
            </div>

            <div class="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label for="lp-phone" class="mb-1.5 block text-sm font-semibold">{{ t('الهاتف') }}</label>
                <Input
                  id="lp-phone"
                  v-model="form.phone"
                  type="tel"
                  inputmode="tel"
                  maxlength="14"
                  dir="ltr"
                  class="h-11"
                  :aria-invalid="gate.show('phone')"
                  :placeholder="PHONE_PLACEHOLDER"
                  @blur="gate.touch('phone')"
                />
                <InputNote :show="gate.show('phone')" :message="errors.phone" :hint="t(PHONE_HINT)" />
              </div>
              <div>
                <label class="mb-1.5 block text-sm font-semibold">
                  {{ t('المدينة') }}
                  <span class="font-normal text-muted-foreground">{{ t('(اختياري)') }}</span>
                </label>
                <!--
                  A native select, on purpose.

                  The application uses a searchable combobox here because its
                  forms are filled dozens of times a day. This field is optional,
                  filled once, and often on a phone — where a native select opens
                  the OS picker the person already knows. It is also one fewer
                  dependency in a repository that is published.

                  Same city list as the app, so a lead that becomes a lab does
                  not arrive with a free-text city.
                -->
                <select
                  v-model="form.city"
                  class="h-9 w-full rounded-md border border-input bg-white px-3 text-sm shadow-xs
                         outline-none focus-visible:border-ring focus-visible:ring-[3px]
                         focus-visible:ring-ring/50"
                >
                  <option value="">{{ t('field.pickCity') }}</option>
                  <option v-for="c in cityOptions(locale)" :key="c.value" :value="c.value">
                    {{ c.label }}
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label for="lp-note" class="mb-1.5 block text-sm font-semibold">
                {{ t('شي تحب تقوله') }}
                <span class="font-normal text-muted-foreground">{{ t('(اختياري)') }}</span>
              </label>
              <Textarea id="lp-note" v-model="form.note" rows="2" :placeholder="t('مثال: عدنا ٦ فنيين و١٢ عيادة')" />
            </div>

            <p v-if="sendError" class="text-[0.82rem] font-semibold text-destructive">
              {{ sendError }}
            </p>

            <!-- Disabled only while sending — see useFieldGate. -->
            <Button size="lg" class="mt-1 h-12" :disabled="sending" @click="submit">
              <Spinner v-if="sending" class="size-4" />
              {{ sending ? t('نرسل…') : t('أرسل الطلب') }}
            </Button>
            <p class="text-center text-[0.76rem] text-muted-foreground">
              {{ t('ما ننشر رقمك ولا نبيعه لأحد.') }}
            </p>
          </div>
        </template>

        <!-- What happens next, in a sentence. «تم الإرسال» leaves a person
             wondering whether anybody actually got it. -->
        <div
          v-else
          class="rounded-2xl border border-[var(--brand-green-soft)] bg-white px-6 py-12 text-center"
        >
          <span class="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[var(--brand-green-tint)]">
            <Check class="size-7 text-[var(--brand-green-dark)]" />
          </span>
          <h2 class="text-xl font-bold">{{ t('وصل طلبك') }}</h2>
          <p class="mx-auto mt-2 max-w-sm text-[0.92rem] leading-relaxed text-muted-foreground">
            {{ t('نتصل بيك خلال يوم عمل واحد على الرقم اللي انطيته.') }}
          </p>
        </div>
      </div>
    </section>

    <!-- ═══ footer ═══════════════════════════════════════════════════════ -->
    <footer class="border-t border-border bg-white pb-8 pt-12">
      <div class="mx-auto max-w-6xl px-5">
        <div class="grid gap-9 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img src="/brand/logo.svg" alt="ToothPath" class="mb-3 h-9 w-auto">
            <p class="max-w-xs text-[0.84rem] leading-relaxed text-muted-foreground">
              {{ t('نظام إدارة معامل الأسنان — صُنع للعراق.') }}
            </p>
          </div>

          <div>
            <p class="mb-3 text-[0.75rem] font-bold tracking-wide text-muted-foreground">{{ t('روابط') }}</p>
            <ul class="space-y-2 text-[0.86rem]">
              <li><button type="button" class="hover:text-primary hover:underline" @click="toHow">{{ t('شلون يشتغل؟') }}</button></li>
              <li><button type="button" class="hover:text-primary hover:underline" @click="toForm">{{ t('اطلب نسختك التجريبية') }}</button></li>
              <li><NuxtLink to="/login" class="hover:text-primary hover:underline">{{ t('تسجيل الدخول') }}</NuxtLink></li>
            </ul>
          </div>

          <div>
            <p class="mb-3 text-[0.75rem] font-bold tracking-wide text-muted-foreground">{{ t('تواصل معنا') }}</p>
            <ul class="space-y-2 text-[0.86rem]">
              <!-- One `tel:` and one `mailto:`, both from the CONTACT constant
                   at the top of this file. -->
              <li>
                <a :href="`tel:${CONTACT.phone}`" class="hover:text-primary hover:underline" dir="ltr">
                  {{ CONTACT.phone }}
                </a>
              </li>
              <li>
                <a :href="waLink" target="_blank" rel="noopener" class="hover:text-primary hover:underline">
                  {{ t('واتساب') }}
                </a>
              </li>
              <li>
                <a :href="`mailto:${CONTACT.email}`" class="hover:text-primary hover:underline" dir="ltr">
                  {{ CONTACT.email }}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p class="mb-3 text-[0.75rem] font-bold tracking-wide text-muted-foreground">{{ t('قانوني') }}</p>
            <ul class="space-y-2 text-[0.86rem]">
              <!-- A real page, not a dead link: /privacy exists. -->
              <li><NuxtLink to="/privacy" class="hover:text-primary hover:underline">{{ t('سياسة الخصوصية') }}</NuxtLink></li>
            </ul>
          </div>
        </div>

        <div class="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p class="text-[0.76rem] text-muted-foreground/70">© {{ new Date().getFullYear() }} ToothPath</p>
          <Button size="sm" @click="toForm">{{ t('اطلب نسختك التجريبية') }}</Button>
        </div>
      </div>
    </footer>
  </div>
</template>
