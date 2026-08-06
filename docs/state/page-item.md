# Generic product page (PDP) — state

`products/item/index.html` + `src/js/item.js`. One template serves every product via `?p=<id>` (`itemHref` in products.js routes here unless a product has a dedicated page). Built to the client's glass product-page spec.

## Standard implementation
- Option chips are generated from `p.options`; pricing resolves through `resolveUnit(p, picks)` (labels are keys — see [pricing-inventory.md](pricing-inventory.md)); unresolved → "From price · confirmed on order".
- `total()` updates the price line **and** the yellow `#miniTot` badge; the mobile m-bar mirrors total/Add.
- SKU synthesised as `GM-<ID3>-<optionIndexes>` (e.g. `GM-PAN-021`), updates live with selection.
- Gallery: arrows `#gPrev`/`#gNext` + count + hint; hover-zoom loupe at scale 2.1 with transform-origin following the cursor.
- Posts helper hint appears for post-type products (length = height + planting depth).
- SEO: dynamic `<link rel="canonical">` per `?p=`; **Product + BreadcrumbList JSON-LD in USD** injected per product.
- Trust row includes **Print spec sheet** → `printSpec()` → `window.print()` (print CSS produces a clean sheet).
- Add to cart carries the resolved ZAR unit, spec, and first gallery image.

## Tests (verified)
- Posts: T-76×40, powder, 3.0 m fence → **$29.66** each (3.6 m post length via `POST_LENGTH_MM`), ×2 in cart totals correctly.
- Chip changes update price, `#miniTot`, SKU, and m-bar together.
- JSON-LD validates with USD `priceCurrency` and the resolved amount.
- Gallery arrows wrap; loupe origin tracks the cursor.

## Notes
- This page has no per-product static HTML — anything SEO-critical that must differ per product goes through the JS-injected head tags; if the client ever needs pre-rendered PDPs, that's a build-step change to raise then.
