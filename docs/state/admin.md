# Admin side — state

`/admin/` console + the data layer that feeds the storefront. Built 2026-08-06.

## Architecture (static site, honest constraints)
- **Published state** = `public/admin-data.json`, fetched once at boot by `src/data/overrides.js` (top-level await; vite `build.target: 'es2022'`). Merge order: code defaults ← published JSON ← **drafts** (`localStorage.gm_admin_drafts`, owner's browser only).
- Every storefront page therefore previews the owner's drafts live (yellow `.draft-flag` ribbon appears, linking to `/admin/#/publish`); visitors only ever see published data.
- **Publishing** commits `admin-data.json` (+ queued media as base64 file commits to `public/images/uploads/`) to GitHub via the contents API → Vercel deploys. The fine-grained GitHub token (localStorage, never published) **is the real security boundary**; the console passphrase (SHA-256 in `settings.adminHash`) is an honest UI gate only. `/admin/` is `noindex,nofollow`.
- No server, stated everywhere it matters: orders/customers live in `localStorage.gm_orders` (written by checkout, cap 200); webhooks are browser-fired JSON POSTs (`fireWebhooks` in overrides.js, best-effort, delivery log in `gm_webhook_log`); gift-code redemption is manual.

## Files
- `src/data/overrides.js` — fetch+merge, `OV`/`SETTINGS`/`PUBLISHED`/`hasDrafts`, `orderLog`, `fireWebhooks`.
- `src/js/admin/store.js` — draft CRUD (dot-path `set`/`get`), `publishPayload()` (pruned), GitHub `publish()`, `exportJSON()`.
- `src/js/admin/api.js` — the API surface, exposed as `window.GM` in the console: storefront, admin, products, collections, search, productRecommendations, cart, checkout, customerAccount/Authentication/Profile/Address/Orders, inventory (lead-time notes only — **never stock counts**, site rule), orders, discounts, giftCards, draftOrders, metafields, files, media, blogs, pages, storeInformation, locations, fulfillment, webhooks. The admin sections are built on these same functions.
- `src/js/admin/admin.js` — auth gate, hash router (`#/section`), 15 sections; **every render swaps in a fresh `#view` node so section listeners can't accumulate or leak across sections** (regression guard).
- `admin/index.html`, `src/styles/admin.css` (console-only, never loaded by storefront pages).
- `pages/index.html` + `src/js/page.js` — public renderer for owner-authored pages/posts at `/pages/?s=slug` (escaped plain text, blank line = paragraph).
- `src/data/map-cities.js` — default SA/US map cities, shared by `us.js` and the Locations section.

## What the owner can manage
**Products — everything, per product** (`#/product/<id>` full editor): title, plain line, description, spec, price-in-ZAR (USD preview), lead note, hide/show, reset-to-factory; **photo gallery** (reorder ▲▼ / remove / add from pool or by path; first = card+page lead, second = hover); **sizes & options** (edit sets and values — labels are pricing keys, and an edited label that no longer resolves falls back to "From price · confirmed on order", never a wrong number); **pairs** ("you may also like", drives PDP pairs + cart/checkout recs). Plus **catalogue ordering** (▲▼ in the list → `settings.productOrder`, drives home grid + catalogue deck) and the **best-sellers rail** order (`settings.bestSellers`).
Also: collections, homepage cover (real-photo pool picker), promo bar, support email, ZAR→USD display rate, checkout fulfilment toggles + note (never both off), discount codes (percent/amount) + gift codes, draft orders (open into the real checkout), metafields, media uploads (≤2.5 MB, publish commits them), pages & blog, both dot-map city sets, webhook subscriptions (orders/create, orders/fulfilled, *), publish/export/discard.

## Storefront wiring points
- `products.js`: overrides applied then hidden products **spliced out** (byId stops resolving; home rail uses `.map(byId).filter(Boolean)`); `CATALOGUE` = pristine pre-override snapshot for admin. `ZAR_PER_USD` reads `settings.rateZarPerUsd`.
- `categories.js`: collections overrides; `BASE_CATEGORIES` snapshot.
- `app.js`: `SUPPORT_EMAIL` (support widget + estimator mailtos), promo-bar text, draft ribbon.
- `home.js`: hero `src` from `settings.hero`.
- `us.js`: `adminCities()` validates city overrides (name/copy/0–1 coords) else falls back to built-ins.
- `checkout.js`: promo field (`findCode`/`discountOf` — percent capped 0–100, amounts never below zero, VAT-inside computed on the discounted total), settings-driven fulfilment, `orderLog.add` + `fireWebhooks('orders/create')` on place.

## Tests (verified headless, 2026-08-06 — rerun after touching any of this)
Gate set/unlock → price R1500 shows $91.46 in admin and the storefront grid → hero + promo overrides visible with draft ribbon → SAVE10: Goods $91.46 / −$9.15 / VAT $10.74 / Total $82.32 → order placed, **webhook POST received by a local node server (topic orders/create, ZAR total 1350)** → order in admin with discount shown, fulfilled → customer derived → page CMS renders at `/pages/?s=installation-guide` (escaped, 2 body paragraphs + updated line) → API console runs `GM.products.get("panels")` → publish payload contains all edits → fresh browser shows the setup gate until adminHash is published → zero console errors → `vite build` passes.

## Adversarial review round (2026-08-06) — findings fixed, regressions to guard
Two skeptical agents audited the whole surface; every confirmed finding was fixed and re-verified:
- **Hiding the panels product crashed its dedicated page** (`byId('panels')` at module top) → panels.js now redirects like the generic PDP, with a `CATALOGUE` fallback keeping boot exception-safe.
- **The boot fetch had no timeout** — a stalled `/admin-data.json` response stranded every page behind the top-level await → `AbortSignal.timeout(3000)`; plus an inline **curtain watchdog** `<script>` on all four curtain pages (also covers pre-es2022 browsers, where the build's top-level await is a SyntaxError — page stays usable, JS features off).
- **Webhook POSTs could be cancelled by the post-order navigation** (the only owner-visible record of a real customer's order) → `keepalive: true`.
- Admin `{once:true}` click delegate went dead after any stray click → removed (the per-render `#view` node swap already owns listener lifecycle).
- Products table full-re-render on `change` ate focus mid-tab → in-place cell update instead.
- `esc()` added where admin-sourced strings reach the public checkout DOM (discount code, totals note); discount `kind` validated + escaped in the console.
- Clearing the store email now sticks (`''` stored, not vanishing `undefined`); `store.set` rejects prototype-chain path segments; gift-code issue retries on collision; map-city coords type-checked (`null >= 0` coercion); `/pages/` filters malformed entries; `.draft-flag` clears the mobile buy bar and is print-hidden.
- **A code covering the whole order blocks submit** ("call the factory to redeem it") — a $0 self-served order was misleading.
Accepted as-is, with reasons: empty city list = reset to built-ins (explicit button exists); publish failure semantics (drafts survive, errors surface, discard only after full success); estimator still quotes a hidden product (it prices from variant data, quote-tool not cart).

## Known limitations (stated, not hidden)
- Orders/customers exist per-browser until a backend exists; the Orders screen says so. Webhooks → Zapier/Make/Monday.com is the current path to durable order capture.
- The passphrase gates the screen, not the data; publishing rights = the GitHub token.
- Media uploads queue in localStorage (quota ~5 MB) until published.
