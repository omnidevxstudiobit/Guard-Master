# Guard Master e-com

US high-security fencing storefront (Clear View 358 mesh). Vanilla ES modules + Vite 6 MPA, GSAP + Lenis, hand-written glass design system. Deploys from `main` → guard-master.vercel.app. Client brief: `GuardMasterFencing.com.pdf` (repo root).

## Hard rules (full detail in the state docs below)
1. **Preview on the running dev server** (`http://localhost:5173/`), never via builds. `npx vite build` is a pre-push smoke check only.
2. **Currency**: ZAR factory data is the source of truth; display is always USD through `zar()` (`ZAR_PER_USD = 16.40` in `src/data/products.js`). Never hand-type a dollar price. VAT is *inside* the price (`× .15/1.15` for the "of which VAT" line), never added on top.
3. **Honesty**: no invented prices, stats, testimonials, stock levels, or social proof. Unresolvable variant → "From price · confirmed on order". SA delivery record belongs to the **sister company**; Guard Master is a **US company** that owns its SA factory.
4. **Performance**: transform/opacity only; backdrop-filter only at rest (`body.scrolling` gates nav frost, blobs, decorative loops) or on open overlays. Fix lag by measure → bisect → gate, never by removing features.
5. **Real media only**: the client's own photos and @wireventures videos. No stock imagery.
6. **Option chip labels are pricing keys** — renaming one breaks `resolveUnit` lookups in `src/data/variant-prices.js`.
7. **Workflow per batch**: verify in headless Edge (screenshot and *look at it*) → commit → push.
8. New pages must be registered in `vite.config.js` inputs and call `initCart()`.

## State docs (read the one for the area you touch — they hold every test, regression, and standard implementation)
| Area | Doc |
|---|---|
| Stack, page map, deploy, adding pages | `docs/state/architecture.md` |
| Glass design system, tokens, a11y fallbacks | `docs/state/design-system.md` |
| Motion rules, measured fps history, GSAP gotchas | `docs/state/performance.md` |
| Pricing data, variant matrix, verified numbers, inventory stance | `docs/state/pricing-inventory.md` |
| Shared chrome: cart store, support FAB, fence footer, anchors, widgets | `docs/state/shared-chrome.md` |
| Verification harness + per-area test checklists | `docs/state/verification.md` |
| Positioning, honesty constraints, contacts, items owed by client | `docs/state/content-rules.md` |
| Home page | `docs/state/page-home.md` |
| Catalogue (`/products/`) | `docs/state/page-catalogue.md` |
| Panels configurator (`/products/clear-view-panels/`) | `docs/state/page-panels.md` |
| Generic PDP (`/products/item/`) | `docs/state/page-item.md` |
| Category pages (`/home-estate/`) | `docs/state/page-category.md` |
| Gallery | `docs/state/page-gallery.md` |
| Estimator (`/estimate/`) | `docs/state/page-estimator.md` |
| Cart page | `docs/state/page-cart.md` |
| Checkout | `docs/state/page-checkout.md` |
| Company page (`/us/`) | `docs/state/page-company.md` |
| Policies | `docs/state/page-policies.md` |
| Admin side (`/admin/`, data layer, webhooks, `/pages/`) | `docs/state/admin.md` |

**Keep these docs current**: when you fix a regression, add a test, or change a standard, update the matching state doc in the same commit.
