// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // TODO: placeholder — replace with the confirmed production domain before launch.
  site: 'https://www.guardmasterfencing.com',
  vite: {
    // @tailwindcss/vite is typed against its own Vite version; Astro bundles a
    // separate Vite, so this structurally-identical plugin needs a cast to align.
    plugins: [/** @type {any} */ (tailwindcss())],
  },
});
