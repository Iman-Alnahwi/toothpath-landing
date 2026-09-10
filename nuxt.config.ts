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
    /*
      ── Server-only, both of them ─────────────────────────────────────────

      `public` is not a security level, it is a delivery mechanism: everything
      under it is serialised into the HTML and reaches every visitor. Measured
      on this build — `plansUrl` sat under `public` and the application's own
      hostname was sitting in the page source of the marketing site, for anyone
      who pressed «view source».

      Neither of these is read in the browser: `server/api/plans.get.ts` and
      `server/api/demo.post.ts` both run on the server. So neither belongs in
      `public`, and now the URL of the product is not published by the page
      advertising it.
    */
    plansUrl: '',
    demoForwardUrl: '',

    /*
      Where a demo request goes when there is no application to forward it to.

      `data/requests.jsonl` — the fallback below — is a real file on a real
      disk, and that is exactly what a serverless host does not have: the
      filesystem is read-only and the instance is discarded after the request.
      Deployed with neither of these set, every lead is accepted with `ok: true`
      and then thrown away, which is the worst of the three outcomes because
      nothing looks broken.
    */
    resendApiKey: '',
    notifyEmail: '',
    mailFrom: 'ToothPath <onboarding@resend.dev>',
    public: {
      /* These three ARE public — they are printed in the footer for people to
         call. Nothing is exposed that the page does not already display. */
      contactPhone: '',
      contactWhatsapp: '',
      contactEmail: '',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ar', dir: 'rtl' },
      link: [{ rel: 'icon', href: '/favicon.svg' }],
    },
  },
})
