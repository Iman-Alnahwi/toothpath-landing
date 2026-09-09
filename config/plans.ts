/**
 * The prices shown when no live endpoint is configured.
 *
 * ── Two homes for one figure, and why it is accepted here ─────────────────
 * In the application these live in the `plans` table and /admin/plans is the
 * only place they are edited. Splitting the site into its own repository put
 * that table out of reach, so this file exists as a fallback.
 *
 * That is a real risk — a price edited in the app and not here means the public
 * site quotes a number the product does not honour. So:
 *
 *   Set NUXT_PUBLIC_PLANS_URL to the live app's `/api/public/plans` and this
 *   file is never read. Use it in production.
 *
 * These values are only for local development and for a deployment that has no
 * application behind it yet.
 */
export interface Plan {
  id: number
  nameAr: string
  nameEn: string
  durationDays: number
  /** In IQD. `0` marks the trial. */
  price: number
}

export const FALLBACK_PLANS: Plan[] = [
  { id: 1, nameAr: 'تجريبي — أسبوع', nameEn: 'Trial — one week', durationDays: 7, price: 0 },
  { id: 2, nameAr: 'شهري', nameEn: 'Monthly', durationDays: 30, price: 150000 },
  { id: 3, nameAr: 'ثلاثة أشهر', nameEn: 'Three months', durationDays: 90, price: 400000 },
  { id: 4, nameAr: 'سنوي', nameEn: 'Yearly', durationDays: 365, price: 1500000 },
]
