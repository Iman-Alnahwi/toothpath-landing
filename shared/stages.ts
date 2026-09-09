/**
 * The eight stages a case moves through, for the marketing site only.
 *
 * ── Why this is a copy and not an import ──────────────────────────────────
 * The application's `shared/types/enums.ts` is 858 lines: every status, every
 * role, every work type, every permission set — the domain model of the whole
 * product. This repository is public. What a landing page needs from it is a
 * list of eight names, so that is what it carries.
 *
 * ⚠️ If a stage is renamed in the app, rename it here too. There is no import
 * to keep them in step, which is the price of the split.
 */
export const STAGES = [
  { key: 'received', ar: 'وصلت', en: 'Received' },
  { key: 'design', ar: 'التصميم', en: 'Design' },
  { key: 'pending_approval', ar: 'عند الطبيب', en: 'With Dentist' },
  { key: 'milling', ar: 'التصنيع', en: 'Milling' },
  { key: 'ceramics', ar: 'التشطيب', en: 'Ceramics' },
  { key: 'ready_for_dispatch', ar: 'جاهزة للإرسال', en: 'Ready to Ship' },
  { key: 'out_for_delivery', ar: 'خرجت للتوصيل', en: 'Out for Delivery' },
  { key: 'delivered', ar: 'سُلّمت', en: 'Delivered' },
] as const

export type StageKey = typeof STAGES[number]['key']

export function stageLabel(key: StageKey, locale: 'ar' | 'en' = 'ar') {
  const s = STAGES.find(x => x.key === key)
  return s ? (locale === 'en' ? s.en : s.ar) : key
}

/** The roles named on the site. The app has more; these are the two the
    illustrations use. */
const ROLES: Record<string, { ar: string, en: string }> = {
  cad_designer: { ar: 'مصمّم', en: 'Designer' },
  ceramist: { ar: 'فني التشطيب', en: 'Ceramist' },
}

export function roleLabel(key: string, locale: 'ar' | 'en' = 'ar') {
  const r = ROLES[key]
  return r ? (locale === 'en' ? r.en : r.ar) : key
}
