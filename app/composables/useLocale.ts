import { LOCALES, MESSAGES, type Locale } from '~/i18n/messages'

/*
  The chosen language, and the lookup that reads it.

  Stored in a cookie rather than in localStorage: the server renders the first
  paint, and it can read a cookie. With localStorage the page would arrive in
  Arabic and flip to English after hydration — a visible flash on every single
  navigation, and a wrong `dir` on the <html> element while it lasted.

  A year's max-age because a person's language is not a session preference.
*/
export function useLocale() {
  const cookie = useCookie<Locale>('toothpath_locale', {
    default: () => 'ar',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
    path: '/',
  })

  const locale = computed<Locale>(() => (cookie.value === 'en' ? 'en' : 'ar'))
  const dir = computed(() => (locale.value === 'en' ? 'ltr' : 'rtl'))

  /*
    A missing key returns the KEY, not an empty string and not a silent
    fallback to the other language. An untranslated label reading
    «page.cases.title» is visible in one glance and fixed in one line; the same
    label falling back to Arabic inside an English screen looks deliberate and
    survives every review.
  */
  function t(key: string, vars?: Record<string, string | number>): string {
    let out = MESSAGES[locale.value][key] ?? key
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        out = out.replaceAll(`{${k}}`, String(v))
      }
    }
    return out
  }

  async function setLocale(next: Locale) {
    if (next === cookie.value) return
    cookie.value = next

    /*
      And re-fetch everything the SERVER answered in the old language.

      Setting the cookie is enough for anything rendered from the dictionary —
      those are reactive. It is not enough for the half of the screen that
      arrives already translated: clinic and dentist names resolved by
      localName(), stage labels from the dashboard, the names substituted into
      a stage note. Those were decided by the endpoint from the cookie it saw
      at request time, and a cookie written afterwards does not go back and
      change them.

      Without this the switch left a page half-translated until the reader hit
      refresh — which is the thing a language toggle exists to avoid.

      refreshNuxtData() re-runs every useFetch/useAsyncData on the page, which
      is exactly the set of things that came from the server. No reload, no
      scroll position lost, no form emptied.

      ── The tick matters ──────────────────────────────────────────────────
      `useCookie` does not write to document.cookie synchronously; it flushes
      on the next tick. Refreshing immediately fired the requests with the OLD
      cookie still attached, so the endpoints answered in the language the
      reader had just left — the dashboard came back with «Baghdad Dental
      Centre» and «Out for Delivery» on an otherwise Arabic screen. It looked
      intermittent, because whether it happened depended on which fetch won
      the race.

      Written to document.cookie directly as well, and not only awaited: the
      direct write is what the request actually reads, and depending on the
      composable's flush timing for correctness is depending on an internal.
    */
    if (import.meta.client) {
      document.cookie = `toothpath_locale=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`
    }
    await nextTick()
    await refreshNuxtData()
  }

  return { locale, dir, t, setLocale, locales: LOCALES }
}
