<script setup lang="ts">
/**
 * A Solar icon, resolved from the local icon set.
 *
 * @iconify/vue fetches icon data from Iconify's API by default. Here the whole
 * Solar set is a dependency and the data is registered up front, so nothing is
 * requested at runtime: the icons work offline, on a lab machine behind a
 * firewall, and cannot flash in late on a slow connection.
 *
 * `name` is the Solar name without the prefix and without the style suffix —
 * `buildings-2`, not `solar:buildings-2-linear`. The style comes from `weight`,
 * so a caller can swap the whole app between line and solid by changing one
 * default rather than editing every call.
 */
import { Icon, addCollection } from '@iconify/vue'
import solar from '@iconify-json/solar/icons.json'

// Registered once per module, not per component instance.
addCollection(solar as never)

const props = withDefaults(defineProps<{
  name: string
  /**
   * `linear` is Solar's outline weight and sits at the same visual weight as
   * the rest of the UI. `bold` is for the one icon that is currently selected.
   */
  weight?: 'linear' | 'bold' | 'bold-duotone' | 'outline'
}>(), { weight: 'linear' })

const full = computed(() => `solar:${props.name}-${props.weight}`)
</script>

<template>
  <Icon :icon="full" />
</template>
