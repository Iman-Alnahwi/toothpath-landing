import { FALLBACK_PLANS } from '~~/config/plans'

/**
 * The prices for the pricing section.
 *
 * Prefers the live application's public endpoint, so a price has ONE home
 * whenever the two are deployed together. Falls back to config/plans.ts when
 * `NUXT_PUBLIC_PLANS_URL` is unset — a fresh clone of this repo still runs.
 *
 * A failed fetch falls back too rather than erroring: a marketing page that
 * shows no prices because an unrelated service is down is a worse outcome than
 * one showing the committed defaults.
 */
export default defineEventHandler(async (event) => {
  const url = useRuntimeConfig(event).public.plansUrl
  const locale = getCookie(event, 'toothpath_locale') === 'en' ? 'en' : 'ar'

  if (url) {
    try {
      return await $fetch(url, { headers: { cookie: `toothpath_locale=${locale}` } })
    }
    catch {
      /* fall through to the committed list */
    }
  }

  return FALLBACK_PLANS.map(p => ({
    id: p.id,
    name: locale === 'en' ? p.nameEn : p.nameAr,
    durationDays: p.durationDays,
    price: p.price,
  }))
})
