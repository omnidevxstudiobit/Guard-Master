// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // TODO: placeholder — replace with the confirmed production domain before launch.
  site: 'https://www.guardmasterfencing.com',

  /**
   * /accessories moved to /clear-fencing-accessories — the page only ever
   * covered the Clear View system's finishing pieces, and the bare noun
   * implied a general accessories catalogue that doesn't exist.
   *
   * Kept as a redirect rather than a clean break: renaming a URL that has
   * been linked or indexed and letting the old one 404 throws away whatever
   * that path had earned. On a static build Astro emits an HTML page with a
   * meta refresh and a canonical link, which is enough for a browser and for
   * a crawler to follow. If this ever moves to a host with real routing
   * (Vercel does), swap it for a 301 there — a meta refresh is a weaker
   * signal than a real status code.
   */
  redirects: {
    '/accessories': '/clear-fencing-accessories',
    '/quote-estimator': '/clear-fencing-estimator',
  },
  vite: {
    // @tailwindcss/vite is typed against its own Vite version; Astro bundles a
    // separate Vite, so this structurally-identical plugin needs a cast to align.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
