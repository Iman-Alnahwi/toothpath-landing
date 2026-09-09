<script setup lang="ts">
/**
 * The privacy page the footer links to.
 *
 * It exists because the link exists. A footer that points at «سياسة الخصوصية»
 * and lands on a 404 is the dead-link failure this project has had four of —
 * and on the one page a stranger reads before trusting the product with their
 * clinic list, it is the worst possible place for it.
 *
 * Deliberately short and specific. It describes what THIS system does with
 * data — the demo form's four fields, and the lab's own records — rather than
 * the two thousand words of boilerplate that say nothing and nobody reads.
 */
const { t, dir } = useLocale()

definePageMeta({ layout: false })
/* Computed, not literal — a hard-coded title stays Arabic on the English site.
   Same fault the landing page had. */
useHead(() => ({ title: t('ToothPath — سياسة الخصوصية') }))

const SECTIONS = [
  {
    h: 'الاستمارة في الصفحة الرئيسية',
    p: 'لمّا تترك طلبًا، نخزّن أربعة أشياء فقط: اسم المعمل، المدينة، رقم الهاتف، وأي ملاحظة تكتبها. نستعملها لشي واحد — نتصل بيك. ما ننشرها، وما نبيعها، وما نعطيها لطرف ثالث.',
  },
  {
    h: 'بيانات معملك',
    p: 'الحالات والعيادات والأطباء والأسعار والحسابات — كلها ملك معملك. كل معمل معزول عن غيره: ما أكو حساب في معمل يقدر يقرأ صفًا واحدًا من معمل ثاني. والعزل مطبَّق في الخادم، مو في الواجهة.',
  },
  {
    h: 'بيانات المرضى',
    p: 'النظام ما يخزّن اسم المريض. الحالة تحمل رمزًا ورقميًا، والعمر والجنس فقط — لأن هذا كل ما يحتاجه المعمل ليشتغل. الأقل هو الأأمن.',
  },
  {
    h: 'منو يشوف شنو',
    p: 'كل دور مقيَّد بما يخصّه: الفني يشوف مرحلته ولا يرى سعرًا أبدًا، والمندوب يشوف الجاهز للتوصيل فقط، والطبيب يشوف حالاته هو. مدير النظام يدير الاشتراكات ولا يدخل على بيانات أي معمل بلا إذن مسجَّل.',
  },
  {
    h: 'كلمات المرور',
    p: 'تُخزَّن مشفّرة باتجاه واحد (bcrypt) — يعني لا نحن ولا أحد غيرنا يقدر يقرأها. وأرقام البطاقات لا تصل خادمنا إطلاقًا: ما يُخزَّن هو نوع البطاقة وآخر أربعة أرقام فقط.',
  },
  {
    h: 'حذف بياناتك',
    p: 'إذا وقفت الاشتراك، بياناتك تبقى مكانها حتى ترجع. وإذا طلبت حذفها، نحذفها — اتصل بينا وتنحذف.',
  },
]
</script>

<template>
  <div :dir="dir" class="min-h-dvh bg-white">
    <header class="border-b border-border">
      <div class="mx-auto flex max-w-3xl items-center justify-between gap-4 px-5 py-4">
        <NuxtLink to="/"><img src="/brand/logo.svg" alt="ToothPath" class="h-9 w-auto"></NuxtLink>
        <LocaleSwitch />
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-5 py-14">
      <h1 class="text-[1.9rem] font-black">{{ t('سياسة الخصوصية') }}</h1>
      <p class="mt-3 text-[0.95rem] leading-[1.9] text-muted-foreground">
        {{ t('مكتوبة بلغة تنقرأ. إذا شي هنا مو واضح، اتصل بينا ونشرحه.') }}
      </p>

      <div class="mt-10 space-y-8">
        <section v-for="s in SECTIONS" :key="s.h">
          <h2 class="text-[1.05rem] font-bold">{{ t(s.h) }}</h2>
          <p class="mt-2 text-[0.92rem] leading-[1.95] text-muted-foreground">{{ t(s.p) }}</p>
        </section>
      </div>

      <NuxtLink to="/" class="mt-12 inline-block text-[0.9rem] font-semibold text-primary hover:underline">
        {{ t('رجوع للصفحة الرئيسية') }}
      </NuxtLink>
    </main>
  </div>
</template>
