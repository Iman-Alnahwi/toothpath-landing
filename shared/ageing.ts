/**
 * The four receivable-ageing bands, for the picture in the «المستحقات» block.
 *
 * A copy of the shape, not of the logic: the application computes which band a
 * debt falls in and how much sits in each. Nothing of that is here — only the
 * four names, their day ranges and their colours, because the site draws a
 * miniature of that bar.
 */
export const AGEING_BANDS = [
  { key: 'current', from: 0, to: 45, color: '#159847', ar: 'ضمن المهلة', en: 'Not yet due' },
  { key: 'late', from: 46, to: 90, color: '#E8A33D', ar: 'متأخّر', en: 'Late' },
  { key: 'serious', from: 91, to: 180, color: '#D2542F', ar: 'متأخّر جدًا', en: 'Very late' },
  { key: 'critical', from: 181, to: null, color: '#96231E', ar: 'متعثّر', en: 'Doubtful' },
] as const

export function bandRange(
  b: { from: number, to: number | null },
  locale: 'ar' | 'en' = 'ar',
) {
  if (b.to === null) return locale === 'en' ? `${b.from}+ days` : `أكثر من ${b.from - 1} يوم`
  return locale === 'en' ? `${b.from}–${b.to} days` : `${b.from}–${b.to} يوم`
}
