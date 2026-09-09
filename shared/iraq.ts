/*
  ═══ Where in Iraq ══════════════════════════════════════════════════════════

  The city was a free-text box, and a free-text box for a place name is a
  guarantee of three spellings of one city. «بغداد», «بغداد » and «Baghdad» are
  three different values to a database and to every filter and grouping built
  on it — «الإيراد حسب المدينة» would report Baghdad twice and neither number
  would be right.

  So it is a list. What the list contains took a decision:

  ── Governorates AND their capitals, not one or the other ──

  Iraq has nineteen governorates, and for eight of them the governorate and its
  main city have different names — بابل's city is الحلة, الأنبار's is الرمادي,
  نينوى's is الموصل. Offering only governorates would make a lab in الحلة pick
  «بابل», which is not what is written on its own sign; offering only cities
  would lose the governorate a reader needs to know how far away it is.

  Both are here, and the `hint` carries the governorate so «الحلة · بابل» reads
  as one answer rather than two options to choose between.

  ── Why the secondary towns ──

  A dental lab is not only a capital-city business. الزبير, تلعفر, الفلوجة and
  خانقين all have clinics, and a list that forced them to file under the nearest
  big city would be the software deciding where they are. The list is long
  enough that nobody has to lie, and searchable so length costs nothing.

  ── Not enforced by the server ──

  The API still accepts any plausible name. This is a convenience that removes
  three spellings of one city, not a ruling on which places may exist — and a
  new town should never need a deploy.
*/

export interface IraqCity {
  /*
    The Arabic name is the STORED value in both languages — the database keeps
    one string per city, and switching the interface language must not change
    what a clinic's record says it is. Only the label changes.
  */
  city: string
  /** Shown when the interface is English. */
  cityEn: string
  governorateEn: string
  /** The governorate, shown as a hint. Equal to `city` for the eight where the
      governorate is named after its capital. */
  governorate: string
}

/*
  Ordered by governorate, capital first within each, so the list reads as a map
  of the country rather than an alphabet — and so the four cities already in
  this database (بغداد، البصرة، أربيل، الحلة) sit where a reader expects them.
*/
export const IRAQ_CITIES: IraqCity[] = [
  /* بغداد */
  { city: 'بغداد', governorate: 'بغداد', cityEn: 'Baghdad', governorateEn: 'Baghdad' },
  { city: 'أبو غريب', governorate: 'بغداد', cityEn: 'Abu Ghraib', governorateEn: 'Baghdad' },
  { city: 'المحمودية', governorate: 'بغداد', cityEn: 'Al-Mahmudiyah', governorateEn: 'Baghdad' },
  { city: 'الطارمية', governorate: 'بغداد', cityEn: 'Al-Tarmiyah', governorateEn: 'Baghdad' },

  /* نينوى — capital الموصل */
  { city: 'الموصل', governorate: 'نينوى', cityEn: 'Mosul', governorateEn: 'Nineveh' },
  { city: 'تلعفر', governorate: 'نينوى', cityEn: 'Tal Afar', governorateEn: 'Nineveh' },
  { city: 'سنجار', governorate: 'نينوى', cityEn: 'Sinjar', governorateEn: 'Nineveh' },
  { city: 'الحمدانية', governorate: 'نينوى', cityEn: 'Al-Hamdaniya', governorateEn: 'Nineveh' },

  /* البصرة */
  { city: 'البصرة', governorate: 'البصرة', cityEn: 'Basra', governorateEn: 'Basra' },
  { city: 'الزبير', governorate: 'البصرة', cityEn: 'Al-Zubair', governorateEn: 'Basra' },
  { city: 'القرنة', governorate: 'البصرة', cityEn: 'Al-Qurnah', governorateEn: 'Basra' },
  { city: 'أبو الخصيب', governorate: 'البصرة', cityEn: 'Abu Al-Khaseeb', governorateEn: 'Basra' },

  /* أربيل */
  { city: 'أربيل', governorate: 'أربيل', cityEn: 'Erbil', governorateEn: 'Erbil' },
  { city: 'شقلاوة', governorate: 'أربيل', cityEn: 'Shaqlawa', governorateEn: 'Erbil' },
  { city: 'سوران', governorate: 'أربيل', cityEn: 'Soran', governorateEn: 'Erbil' },
  { city: 'كويسنجق', governorate: 'أربيل', cityEn: 'Koya', governorateEn: 'Erbil' },

  /* السليمانية */
  { city: 'السليمانية', governorate: 'السليمانية', cityEn: 'Sulaymaniyah', governorateEn: 'Sulaymaniyah' },
  { city: 'رانية', governorate: 'السليمانية', cityEn: 'Ranya', governorateEn: 'Sulaymaniyah' },
  { city: 'دربندخان', governorate: 'السليمانية', cityEn: 'Darbandikhan', governorateEn: 'Sulaymaniyah' },
  { city: 'چمچمال', governorate: 'السليمانية', cityEn: 'Chamchamal', governorateEn: 'Sulaymaniyah' },

  /* دهوك */
  { city: 'دهوك', governorate: 'دهوك', cityEn: 'Duhok', governorateEn: 'Duhok' },
  { city: 'زاخو', governorate: 'دهوك', cityEn: 'Zakho', governorateEn: 'Duhok' },
  { city: 'العمادية', governorate: 'دهوك', cityEn: 'Amedi', governorateEn: 'Duhok' },
  { city: 'سميل', governorate: 'دهوك', cityEn: 'Sumel', governorateEn: 'Duhok' },

  /* حلبجة — the nineteenth, made a governorate in 2014 */
  { city: 'حلبجة', governorate: 'حلبجة', cityEn: 'Halabja', governorateEn: 'Halabja' },

  /* كركوك */
  { city: 'كركوك', governorate: 'كركوك', cityEn: 'Kirkuk', governorateEn: 'Kirkuk' },
  { city: 'الحويجة', governorate: 'كركوك', cityEn: 'Hawija', governorateEn: 'Kirkuk' },
  { city: 'داقوق', governorate: 'كركوك', cityEn: 'Daquq', governorateEn: 'Kirkuk' },

  /* الأنبار — capital الرمادي */
  { city: 'الرمادي', governorate: 'الأنبار', cityEn: 'Ramadi', governorateEn: 'Anbar' },
  { city: 'الفلوجة', governorate: 'الأنبار', cityEn: 'Fallujah', governorateEn: 'Anbar' },
  { city: 'هيت', governorate: 'الأنبار', cityEn: 'Hit', governorateEn: 'Anbar' },
  { city: 'حديثة', governorate: 'الأنبار', cityEn: 'Haditha', governorateEn: 'Anbar' },
  { city: 'القائم', governorate: 'الأنبار', cityEn: 'Al-Qaim', governorateEn: 'Anbar' },

  /* بابل — capital الحلة */
  { city: 'الحلة', governorate: 'بابل', cityEn: 'Al-Hillah', governorateEn: 'Babil' },
  { city: 'المحاويل', governorate: 'بابل', cityEn: 'Al-Mahawil', governorateEn: 'Babil' },
  { city: 'الهاشمية', governorate: 'بابل', cityEn: 'Al-Hashimiyah', governorateEn: 'Babil' },
  { city: 'المسيب', governorate: 'بابل', cityEn: 'Al-Musayyib', governorateEn: 'Babil' },

  /* كربلاء */
  { city: 'كربلاء', governorate: 'كربلاء', cityEn: 'Karbala', governorateEn: 'Karbala' },
  { city: 'عين التمر', governorate: 'كربلاء', cityEn: 'Ain Al-Tamur', governorateEn: 'Karbala' },
  { city: 'الهندية', governorate: 'كربلاء', cityEn: 'Al-Hindiyah', governorateEn: 'Karbala' },

  /* النجف */
  { city: 'النجف', governorate: 'النجف', cityEn: 'Najaf', governorateEn: 'Najaf' },
  { city: 'الكوفة', governorate: 'النجف', cityEn: 'Kufa', governorateEn: 'Najaf' },
  { city: 'المناذرة', governorate: 'النجف', cityEn: 'Al-Manathera', governorateEn: 'Najaf' },

  /* القادسية — capital الديوانية */
  { city: 'الديوانية', governorate: 'القادسية', cityEn: 'Diwaniyah', governorateEn: 'Al-Qadisiyyah' },
  { city: 'الشامية', governorate: 'القادسية', cityEn: 'Al-Shamiyah', governorateEn: 'Al-Qadisiyyah' },
  { city: 'عفك', governorate: 'القادسية', cityEn: 'Afak', governorateEn: 'Al-Qadisiyyah' },

  /* ذي قار — capital الناصرية */
  { city: 'الناصرية', governorate: 'ذي قار', cityEn: 'Nasiriyah', governorateEn: 'Dhi Qar' },
  { city: 'الشطرة', governorate: 'ذي قار', cityEn: 'Al-Shatrah', governorateEn: 'Dhi Qar' },
  { city: 'سوق الشيوخ', governorate: 'ذي قار', cityEn: 'Suq Al-Shuyukh', governorateEn: 'Dhi Qar' },
  { city: 'الرفاعي', governorate: 'ذي قار', cityEn: 'Al-Rifai', governorateEn: 'Dhi Qar' },

  /* المثنى — capital السماوة */
  { city: 'السماوة', governorate: 'المثنى', cityEn: 'Samawah', governorateEn: 'Al-Muthanna' },
  { city: 'الرميثة', governorate: 'المثنى', cityEn: 'Al-Rumaithah', governorateEn: 'Al-Muthanna' },
  { city: 'الخضر', governorate: 'المثنى', cityEn: 'Al-Khidhir', governorateEn: 'Al-Muthanna' },

  /* ميسان — capital العمارة */
  { city: 'العمارة', governorate: 'ميسان', cityEn: 'Amarah', governorateEn: 'Maysan' },
  { city: 'المجر الكبير', governorate: 'ميسان', cityEn: 'Al-Majar Al-Kabir', governorateEn: 'Maysan' },
  { city: 'قلعة صالح', governorate: 'ميسان', cityEn: 'Qalat Salih', governorateEn: 'Maysan' },

  /* واسط — capital الكوت */
  { city: 'الكوت', governorate: 'واسط', cityEn: 'Kut', governorateEn: 'Wasit' },
  { city: 'الحي', governorate: 'واسط', cityEn: 'Al-Hay', governorateEn: 'Wasit' },
  { city: 'بدرة', governorate: 'واسط', cityEn: 'Badra', governorateEn: 'Wasit' },

  /* صلاح الدين — capital تكريت */
  { city: 'تكريت', governorate: 'صلاح الدين', cityEn: 'Tikrit', governorateEn: 'Salah Al-Din' },
  { city: 'سامراء', governorate: 'صلاح الدين', cityEn: 'Samarra', governorateEn: 'Salah Al-Din' },
  { city: 'بلد', governorate: 'صلاح الدين', cityEn: 'Balad', governorateEn: 'Salah Al-Din' },
  { city: 'الدجيل', governorate: 'صلاح الدين', cityEn: 'Al-Dujail', governorateEn: 'Salah Al-Din' },
  { city: 'الشرقاط', governorate: 'صلاح الدين', cityEn: 'Al-Shirqat', governorateEn: 'Salah Al-Din' },

  /* ديالى — capital بعقوبة */
  { city: 'بعقوبة', governorate: 'ديالى', cityEn: 'Baqubah', governorateEn: 'Diyala' },
  { city: 'المقدادية', governorate: 'ديالى', cityEn: 'Al-Muqdadiyah', governorateEn: 'Diyala' },
  { city: 'خانقين', governorate: 'ديالى', cityEn: 'Khanaqin', governorateEn: 'Diyala' },
  { city: 'بلدروز', governorate: 'ديالى', cityEn: 'Baladrooz', governorateEn: 'Diyala' },
  { city: 'الخالص', governorate: 'ديالى', cityEn: 'Al-Khalis', governorateEn: 'Diyala' },
]

/**
 * Options for FieldSelect.
 *
 * The governorate appears as a hint ONLY where it differs from the city, so
 * «بغداد · بغداد» does not appear and «الحلة · بابل» does — the hint is there
 * to answer «where is that», and repeating the name answers nothing.
 */
export function cityOptions(locale: 'ar' | 'en' = 'ar') {
  const en = locale === 'en'
  return IRAQ_CITIES.map((c) => {
    const label = en ? c.cityEn : c.city
    const gov = en ? c.governorateEn : c.governorate
    return {
      /* The VALUE stays Arabic in both languages: it is what goes in the
         column, and an English UI must not start writing «Baghdad» into a
         table whose other rows say «بغداد». */
      value: c.city,
      label,
      hint: gov === label ? undefined : ` · ${gov}`,
    }
  })
}

/** The Arabic list, for callers with no locale to hand. */
export const CITY_OPTIONS = cityOptions('ar')

/** The label for a stored city, in the asked-for language. */
export function cityLabel(city: string | null | undefined, locale: 'ar' | 'en' = 'ar'): string {
  if (!city) return '—'
  const row = IRAQ_CITIES.find(c => c.city === city)
  if (!row) return city
  return locale === 'en' ? row.cityEn : row.city
}

/** Every governorate, once, in the order above. */
export const IRAQ_GOVERNORATES = [...new Set(IRAQ_CITIES.map(c => c.governorate))]

export function governorateOf(city: string | null | undefined): string | null {
  if (!city) return null
  return IRAQ_CITIES.find(c => c.city === city)?.governorate ?? null
}

/* A self-check at import: nineteen governorates, and no city listed twice.
   A duplicated entry would show the same place twice in the dropdown, which
   reads as a bug in the list rather than a slip in a data file. */
if (IRAQ_GOVERNORATES.length !== 19) {
  throw new Error(`iraq: expected 19 governorates, found ${IRAQ_GOVERNORATES.length}`)
}
const seen = new Set<string>()
for (const c of IRAQ_CITIES) {
  if (seen.has(c.city)) throw new Error(`iraq: «${c.city}» listed twice`)
  seen.add(c.city)
}
