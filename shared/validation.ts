/**
 * The two rules the public form needs — phone and name — and nothing else.
 *
 * ── Why a trimmed copy ────────────────────────────────────────────────────
 * The application's validation module also covers emails, passwords, scan
 * links, patient ages and prices. This site collects a lab name and a phone
 * number, so it carries those two rules and no more.
 *
 * They are kept WORD FOR WORD from the app, including the messages: a lab that
 * fills this form and later fills a form inside the product should be refused
 * for the same reason in the same words.
 */

const ARABIC_INDIC = '٠١٢٣٤٥٦٧٨٩'
const EASTERN_ARABIC = '۰۱۲۳۴۵۶۷۸۹'

/**
 * Arabic-Indic and Persian digits to Western ones.
 *
 * Not a nicety: an Iraqi keyboard types ٠٧٧ by default, and a clinic in this
 * very database is stored as «٠٧٠٧٦٦٥٨٨٠». Rejecting that as «not a number»
 * would be the software telling a user their own numerals are wrong; storing
 * it as typed makes the phone unsearchable and un-dialable from a link.
 */
export function toWesternDigits(value: string): string {
  let out = ''
  for (const ch of value) {
    const ai = ARABIC_INDIC.indexOf(ch)
    if (ai >= 0) { out += String(ai); continue }
    const ea = EASTERN_ARABIC.indexOf(ch)
    if (ea >= 0) { out += String(ea); continue }
    out += ch
  }
  return out
}

/*
  Iraqi mobile numbers are 11 digits: the trunk 0, then 7XX, then seven more —
  07801234567. Asiacell is 077x, Zain 078x and 079x, Korek 075x.

  Eleven, not ten. Checked against the records already in this database before
  the rule was written: 21 of 23 stored numbers are eleven digits beginning
  07, and the two that are not are the two that are wrong — one truncated to
  ten (0755645358) and one typed in Arabic-Indic digits.
*/
export const PHONE_LENGTH = 11
export const PHONE_PREFIX = '07'
export const PHONE_PLACEHOLDER = '07XXXXXXXXX'


/**
 * What we store: Western digits only.
 *
 * Spaces, dashes and the +964 country form are all how people actually write
 * a number, and all of them are the same number. Normalising on the way in
 * means search, `tel:` links and duplicate checks work on one shape.
 */
export function normalisePhone(value: unknown): string {
  let s = toWesternDigits(String(value ?? '').trim())
  s = s.replace(/[\s()\-.]/g, '')
  // +9647… and 009647… are the international spellings of 07…
  s = s.replace(/^\+?964/, '0').replace(/^00964/, '0')
  // A bare 7XX… is the national number with the trunk zero dropped.
  if (/^7\d{9}$/.test(s)) s = `0${s}`
  return s
}

export function isValidPhone(value: unknown): boolean {
  const s = normalisePhone(value)
  return s.length === PHONE_LENGTH && s.startsWith(PHONE_PREFIX) && /^\d+$/.test(s)
}

/** Optional field: empty passes, anything present must be a real number. */
export function isValidOptionalPhone(value: unknown): boolean {
  const s = String(value ?? '').trim()
  return s === '' || isValidPhone(s)
}

/*
  A minimum of two characters, not one.

  A single letter is almost always a slip of the keyboard rather than a name,
  and a lab full of records called «a» is unsearchable. Any script is allowed:
  this system holds Arabic, Kurdish and Latin names, sometimes in one row.
*/
export const NAME_MIN = 2


export function isValidName(value: unknown): boolean {
  return String(value ?? '').trim().length >= NAME_MIN
}


interface Opts { required?: boolean, locale?: 'ar' | 'en' }
function say(opts: Opts, ar: string, en: string): string {
  return opts.locale === 'en' ? en : ar
}

export function phoneProblem(value: unknown, opts: Opts = {}): string {
  const raw = String(value ?? '').trim()
  if (!raw) return opts.required ? say(opts, 'أدخل رقم الهاتف', 'Enter the phone number') : ''

  const s = normalisePhone(raw)
  if (!/^\d+$/.test(s)) return say(opts, 'أدخل أرقامًا فقط في رقم الهاتف', 'A phone number takes digits only')
  if (!s.startsWith(PHONE_PREFIX)) return say(opts, 'يجب أن يبدأ رقم الهاتف بـ٠٧', 'A phone number has to begin with 07')
  /* «١١ رقمًا» — accusative singular after eleven, not «١١ أرقام». */
  if (s.length !== PHONE_LENGTH) return say(opts, 'يجب أن يكون رقم الهاتف ١١ رقمًا', 'A phone number has to be 11 digits')
  return ''
}

/*
  ── Is this a name, or is it a hand resting on the keyboard? ────────────────

  A lab name is not a private note: it is what every dentist sees in the
  directory before deciding whether to send work, and what the case history
  will still be labelled with in two years. «jkhkh» got through the old rule
  because the old rule only counted characters.

  Software cannot read Arabic or Kurdish or English and judge whether a word
  is a real name — a dictionary would reject «Zirmax» and every family name it
  had never met. So this does not try. It refuses only what is certainly NOT a
  name, and lets everything else through: a false accept is a typo somebody
  fixes, a false REJECT is the software telling a real business its own name is
  wrong.

  Three certainties:
*/
function looksLikeAName(s: string): boolean {
  const letters = s.replace(/[^\p{L}]/gu, '')

  /* ① Something has to be a letter. «..», «12», «؟؟» are not names. */
  if (!letters) return false

  /*
    ② Too few distinct letters for the length.

    One character held down — «ااااا», «kkkk» — needs three letters before it
    counts: a short name carrying a single letter («A1», an initial) is not
    judged at all.

    Two characters alternating is the same gesture with two fingers, and
    «تنتنتنتنت» walked past the single-character rule. It needs six letters
    before it counts, because «بابا», «ماما» and «سوسو» are real four-letter
    names with exactly two distinct letters. And nine letters with only three
    distinct is the same hand again: «عبدالله» is seven letters with six.

    Thresholds set from real names rather than from a formula. Each one was
    tried against every name already in this database before it was allowed in
    — a rule that rejects a customer's own name is worse than one that lets a
    typo through.
  */
  const distinct = new Set(letters.toLowerCase()).size
  if (letters.length >= 3 && distinct === 1) return false
  if (letters.length >= 6 && distinct <= 2) return false
  if (letters.length >= 9 && distinct <= 3) return false

  /*
    ③ A Latin run with no vowel in it.

    «jkhkh», «kjkjk», «jkhjkh» — all three of the strings that prompted this —
    contain no a, e, i, o, u or y, and essentially no Latin word or name does.
    Applied ONLY to Latin script: Arabic is written without short vowels, so
    «مجمع» is a perfectly good name with none of ا و ي in it, and this test
    would reject half the language.

    Uppercase runs of five or fewer are let through as acronyms — «MDT», «PWC»
    — because refusing a real lab's initials would be exactly the false
    rejection this whole function is written to avoid.
  */
  const latin = letters.replace(/[^A-Za-z]/g, '')
  const isLatinOnly = latin.length === letters.length
  if (isLatinOnly && latin.length > 1) {
    if (latin === latin.toUpperCase() && latin.length <= 5) return true
    if (!/[aeiouyAEIOUY]/.test(latin)) return false
  }

  /*
    ④ A run along the keyboard.

    «asdf» has a vowel and so slipped past ③, but nobody's lab is called that.
    Only whole-string matches: a real name that happens to CONTAIN «asd» must
    not be refused, and this list is short on purpose — it catches the four or
    five things a hand does when it is not typing.
  */
  const RUNS = [
    'qwerty', 'qwert', 'qwer', 'asdfgh', 'asdfg', 'asdf', 'zxcvb', 'zxcv',
    'asd', 'zxc', 'qaz', 'wsx', '1234', '12345', 'abcd', 'abc',
  ]
  if (RUNS.includes(latin.toLowerCase())) return false

  return true
}

export function nameProblem(
  value: unknown,
  label = 'الاسم',
  opts: Opts = { required: true },
  /* The field's name in English. Passed separately because `label` is the
     Arabic one and appears inside the Arabic sentence; an English message that
     says «Enter الاسم» is worse than either language on its own. Falls back to
     a generic word rather than printing the Arabic. */
  labelEn = 'a name',
): string {
  const s = String(value ?? '').trim()
  const en = opts.locale === 'en'
  if (!s) {
    if (!opts.required) return ''
    return en ? `Enter ${labelEn}` : `أدخل ${label}`
  }
  /* «حرفين» — the dual, not «٢ أحرف». */
  if (s.length < NAME_MIN) {
    return en
      ? `${labelEn[0]!.toUpperCase()}${labelEn.slice(1)} has to be at least ${NAME_MIN} characters`
      : `يجب أن يكون ${label} حرفين على الأقل`
  }
  if (!looksLikeAName(s)) {
    return en
      ? `That does not look like a name — write ${labelEn} as it is known`
      : `هذا لا يبدو اسمًا — اكتب ${label} كما يُعرف به`
  }
  return ''
}

export const PHONE_HINT = '١١ رقمًا يبدأ بـ٠٧'
