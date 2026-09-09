<script setup lang="ts">
/*
  The language switch.

  ── Two buttons, not a dropdown ──

  There are exactly two languages and there will not be twelve. A select costs
  a click to open before the click that chooses, and hides the option you are
  not on — which is the one thing a person looking for this control wants to
  see. Two labels, one of them marked as current, answers «what am I on» and
  «what can I switch to» without being opened.

  ── Written in their own scripts, never translated ──

  «العربية» and «English», not «Arabic» and «الإنكليزية». Somebody who cannot
  read the current language must still be able to find their own — which is
  impossible if the option is written in the language they are trying to leave.
*/
const { locale, setLocale, locales } = useLocale()
</script>

<template>
  <div
    class="flex items-center gap-0.5 rounded-lg bg-secondary/60 p-0.5"
    role="group"
    :aria-label="locale === 'en' ? 'Language' : 'اللغة'"
  >
    <button
      v-for="l in locales"
      :key="l.code"
      type="button"
      class="rounded-md px-2 py-1 text-[0.72rem] font-semibold transition-colors"
      :class="locale === l.code
        ? 'bg-white text-foreground shadow-xs'
        : 'text-muted-foreground hover:text-foreground'"
      :aria-pressed="locale === l.code"
      :dir="l.dir"
      @click="setLocale(l.code)"
    >{{ l.label }}</button>
  </div>
</template>
