# Clear View panels page (flagship configurator) — state

`products/clear-view-panels/index.html` + `src/js/panels.js`. Rebuilt per client ("build ur panel and everything should more easy to use by user… same glass design") — one build-and-buy flow.

## Layout
Left: gallery (loupe hover-zoom + lightbox) + helper card with **imperial-first** height advice. Right: `#configure` builder card (heading + yellow `#miniTot` badge) + `.buy` box. Mobile `.m-bar` mirrors total (`#mTotal`) and Add (`#mAdd` forwards to `#addBtn.click()`).

## Standard implementation
- All controls are the **shared** `.chip`/`.chips` system — no page-local chip/qty styles (they were removed; don't reintroduce).
- Sizes are objects `{v:'3m × 1.8m', t:"10′ × 6′"}` — metric value key `v` drives pricing, imperial `t` leads the label. **`sel.sz` must be initialised from `SZS[0].v`** (the string), never the object.
- `price()` resolves the ZAR unit via `panelUnit()`/`PANEL_KEYS` from `variant-prices.js`, renders via `zar()` into `#price`, `#miniTot`, `#mTotal`; unresolvable combos show "From price · confirmed on order".
- `drawPlate` renders a true-scale SVG of the chosen panel (width/height proportional). `ADVICE` maps selections to helper copy.
- Add to cart carries the configured ZAR unit + spec string.

## Tests (verified)
- Default config prices **$77.55** (= R1,271.90 incl VAT); every chip change moves all three price outputs consistently.
- All 96 matrix combos resolve (wire × security × height × finish).
- Add from desktop and from the m-bar both land the configured line in the cart.
- Gallery lightbox opens/closes; loupe follows cursor.

## Regressions fixed (both from user screenshots)
- **Page stuck "still loading" + empty yellow wipe**: after the imperial-label change made `SZS` entries objects, `sel.sz.split(...)` threw at boot, which killed the module — leaving the curtain up and the wipe empty. Fix: `sz: SZS[0].v`. **Lesson recorded in [shared-chrome.md](shared-chrome.md): a top-level throw on any page strands the curtain — keep page boot exception-safe.**
- Earlier version had duplicated local styles drifting from the design system → deleted in favour of shared `.chip`/`.pick`/`.mini-tot`.
