# Architecture — state

## Stack (deliberate, do not swap)
- Vanilla ES modules + **Vite 6** multi-page app. Every page is a real `index.html` registered in `vite.config.js` `rollupOptions.input` (11 inputs: home, catalog, panels, item, policies, gallery, us, estimate, cart, checkout, homeEstate). **A new page is not built until it is added there.**
- **GSAP 3.15** (ScrollTrigger, SplitText) + **Lenis 1.3** smooth scroll, all wiring in `src/js/motion.js`.
- Hand-written CSS design system, single file: `src/styles/app.css` (~1500 lines). No Tailwind, no shadcn, no React, no Three.js/WebGL (client brief forbids 3D on load; WebGL water-ripple was evaluated and rejected).
- Fonts: Archivo variable, self-hosted at `public/fonts/archivo-variable.woff2`.
- `public/` is served at the web root untouched — client photography, videos, favicon live there.

## Page → module map
| URL | HTML | JS entry |
|---|---|---|
| `/` | `index.html` | `src/js/home.js` |
| `/products/` | `products/index.html` | `src/js/catalog.js` |
| `/products/clear-view-panels/` | `products/clear-view-panels/index.html` | `src/js/panels.js` |
| `/products/item/?p=<id>` | `products/item/index.html` | `src/js/item.js` |
| `/home-estate/` | `home-estate/index.html` | `src/js/category.js` (generic, keyed by `body[data-cat]`) |
| `/gallery/` | `gallery/index.html` | `src/js/gallery.js` |
| `/estimate/` | `estimate/index.html` | `src/js/estimate.js` |
| `/cart/` | `cart/index.html` | `src/js/cartpage.js` |
| `/checkout/` | `checkout/index.html` | `src/js/checkout.js` |
| `/us/` (Company) | `us/index.html` | `src/js/us.js` |
| `/policies/` | `policies/index.html` | `src/js/policies.js` |

Shared modules: `src/js/app.js` (chrome + widgets, see [shared-chrome.md](shared-chrome.md)), `src/js/motion.js` (see [performance.md](performance.md)). Data: `src/data/products.js`, `src/data/variant-prices.js`, `src/data/categories.js` (see [pricing-inventory.md](pricing-inventory.md)).

## Deploy
- GitHub `siraajul/Guard-Master`, branch `main` → Vercel at guard-master.vercel.app. Push to main deploys.
- Client brief: `GuardMasterFencing.com.pdf` at repo root. Read it before changing positioning, SEO, or page structure.

## Legacy / stray files (do not build on these)
- `cart-control.html` (repo root) — old prototype, **not** in vite inputs, dead.
- `Scene.mp4`, `docs/4-3.mp4` — design-reference videos, not site assets.
- `.claude/skills/` + `.agents/skills/` higgsfield-* — unrelated tooling, ignore.

## Standard for adding a page
1. Create `<route>/index.html` with the shared nav/footer chrome (copy from a sibling page).
2. Create `src/js/<name>.js` that imports and calls `initCart()` at minimum (that wires the whole shared chrome).
3. Register in `vite.config.js` inputs.
4. Verify on the dev server, screenshot, commit, push (see [verification.md](verification.md)).
