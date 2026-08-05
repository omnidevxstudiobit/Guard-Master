import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// package.json sets "type": "module", so this config is an ES module and
// __dirname does not exist here — derive it from import.meta.url instead.
const root = fileURLToPath(new URL('.', import.meta.url))

// Multi-page site. `public/` already holds the client's photography and the
// Archivo variable font, and Vite serves it from the web root untouched.
export default defineConfig({
  server: { port: 5173, open: false },
  build: {
    rollupOptions: {
      input: {
        home: resolve(root, 'index.html'),
        catalog: resolve(root, 'products/index.html'),
        panels: resolve(root, 'products/clear-view-panels/index.html'),
        item: resolve(root, 'products/item/index.html'),
        policies: resolve(root, 'policies/index.html'),
        gallery: resolve(root, 'gallery/index.html'),
        cart: resolve(root, 'cart/index.html'),
        checkout: resolve(root, 'checkout/index.html'),
        homeEstate: resolve(root, 'home-estate/index.html'),
      },
    },
  },
})
