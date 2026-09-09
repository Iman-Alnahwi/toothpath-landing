/**
 * Arabic agrees a counted noun four different ways, and getting it wrong is the
 * loudest kind of wrong in a UI: "14 أيام" and "6 حالة" both read as broken
 * software to a native reader.
 *
 *   1        singular          يوم واحد · حالة واحدة
 *   2        its own dual      يومين · حالتين
 *   3-10     plural            3 أيام · 6 حالات
 *   11+      singular again    14 يومًا · 22 حالة
 *
 * Auto-imported by Nuxt from app/utils, so every screen counts the same way.
 *
 * @example countNoun(14, DAY)   // "14 يومًا"
 * @example countNoun(6, CASE)   // "6 حالات"
 */
export interface NounForms {
  /** n === 1 — the word alone, no numeral. */
  one: string
  /**
   * n === 2 — the dual, in the genitive/accusative («يومين»), not the
   * nominative («يومان»). Every use here follows a preposition or a
   * predicate — «بعد يومين», «متأخرة يومين», «من حالتين» — where the
   * nominative is simply wrong.
   */
  two: string
  /** 3-10 — the plural, numeral included by the caller's template. */
  few: string
  /** 11 and up — singular in the accusative. */
  many: string
  /*
    English needs two forms, not four, and always keeps the numeral — Arabic
    «يوم واحد» drops it, English «day» alone does not read as one day. So the
    English branch always prints the number.
  */
  enOne: string
  enMany: string
}

export const DAY: NounForms = { one: 'يوم', two: 'يومين', few: 'أيام', many: 'يومًا' , enOne: 'day', enMany: 'days' }
export const CASE_N: NounForms = { one: 'حالة', two: 'حالتين', few: 'حالات', many: 'حالة' , enOne: 'case', enMany: 'cases' }
export const HOUR: NounForms = { one: 'ساعة', two: 'ساعتين', few: 'ساعات', many: 'ساعة' , enOne: 'hour', enMany: 'hours' }
export const FITTING: NounForms = { one: 'تركيبة', two: 'تركيبتين', few: 'تركيبات', many: 'تركيبة' , enOne: 'unit', enMany: 'units' }
export const LAB: NounForms = { one: 'معمل', two: 'معملين', few: 'معامل', many: 'معملًا', enOne: 'lab', enMany: 'labs' }
export const SUBSCRIPTION: NounForms = { one: 'مدّة', two: 'مدّتين', few: 'مدد', many: 'مدّة', enOne: 'subscription', enMany: 'subscriptions' }

export function countNoun(n: number, forms: NounForms, locale: 'ar' | 'en' = 'ar') {
  const abs = Math.abs(n)
  if (locale === 'en') return `${abs} ${abs === 1 ? forms.enOne : forms.enMany}`
  if (abs === 1) return forms.one
  if (abs === 2) return forms.two
  return `${abs} ${abs <= 10 ? forms.few : forms.many}`
}

/* Payment notices — «إشعارين» is the genitive/accusative dual, so put the count
   after a preposition: «في إشعارين بانتظار تأكيدك» ✓. See the NounForms note. */
/* «مُدِّدت من قبل مرّتين» — the repeat-extension warning on ExtendDueDialog. */
export const TIMES: NounForms = { one: 'مرّة', two: 'مرّتين', few: 'مرّات', many: 'مرّة', enOne: 'time', enMany: 'times' }

export const NOTICE: NounForms = { one: 'إشعار', two: 'إشعارين', few: 'إشعارات', many: 'إشعارًا', enOne: 'notice', enMany: 'notices' }
