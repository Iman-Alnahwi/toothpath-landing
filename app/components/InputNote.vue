<script setup lang="ts">
/*
  The line under an input: an error if there is one, otherwise the hint.

  One component so the two never stack. A field showing «8 أحرف على الأقل» and
  «كلمة المرور قصيرة» at the same time says the same thing twice and pushes the
  form taller mid-typing, which moves the button under the reader's cursor.

  ── Why it is not called FieldError ──────────────────────────────────────────
  It was, and shadcn's `ui/field` registry owns that name. Nuxt resolved every
  `<FieldError>` in the app to the registry's component, which reads an
  `errors` array and renders `v-if="$slots.default || content"` — so our
  `:show/:message/:hint` were dropped as unknown attributes and the element
  rendered nothing at all. The forms still refused to submit, so validation
  looked like it worked; it just never said why. Twenty call sites across nine
  pages were silently mute. Do not rename this back, and check
  `app/components/ui/` before naming any new component.
*/
defineProps<{
  /** Show the error rather than the hint. */
  show?: boolean
  message?: string
  hint?: string
}>()
</script>

<template>
  <p v-if="show && message" class="mt-1 text-xs font-semibold text-destructive">
    {{ message }}
  </p>
  <p v-else-if="hint" class="mt-1 text-xs text-muted-foreground">
    {{ hint }}
  </p>
</template>
