import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'

/**
 * The marketing site, and nothing else.
 *
 * It is a separate project from the ToothPath application on purpose: this repo
 * is public, and the app's repo holds the domain model, the database schema and
 * real clinic data. Nothing here imports from there, so nothing there can leak
 * out through here.
 */
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],
  vite: { plugins: [tailwindcss()] },

  /* The copied shadcn components import from `@/lib/utils`. */
  alias: { '@': fileURLToPath(new URL('./app', import.meta.url)) },

  runtimeConfig: {
    /* Server-only. Empty means «store requests in this project's own file». */
    demoForwardUrl: '',
    public: {
      contactPhone: '',
      contactWhatsapp: '',
      contactEmail: '',
      /* Empty means «use config/plans.ts». See the note there. */
      plansUrl: '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ar', dir: 'rtl' },
      link: [{ rel: 'icon', href: '/favicon.svg' }],
    },
  },
})
