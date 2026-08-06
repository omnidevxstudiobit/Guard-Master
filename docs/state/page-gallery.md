# Gallery page — state

`gallery/index.html` + `src/js/gallery.js`. Two views, per the Jitter references (reimplemented as original code).

## Standard implementation
- **Orbit view**: category cards drift on a shared rAF loop (`loop.t`); `place(card, xn)` positions them on the arc. `prefers-reduced-motion` → static fan, no loop.
- **Focus view**: `openCat(cat)` swaps to a stage (`#gvStage`) cycling that category's photos — `photosFor(cat)` = the category's product galleries (`CAT_IMG` map + `EXTRA` additions). Slot-based layout (`slot(o)`), prev/next with wrap (`go(i)`), auto-cycle with `startAuto`/`stopAuto` (any manual nudge restarts the clock), click-to-zoom toggle (`toggleZoom`).
- **Hash routing**: `#home-estate` (etc.) opens that set directly; browser Back closes the focus view (`route()` listens to hashchange). Deep links work.
- Only real client photography — the same `public/images/products/**` pools the PDPs use.

## Tests (verified)
- Orbit renders all categories; clicking one enters focus view and the hash updates.
- Arrows/keys wrap around the set; zoom toggles; Back returns to orbit.
- Reduced-motion shows the static fan with no drift loop.

## Notes
- Adding a category to the gallery = extend `CAT_IMG` (and optionally `EXTRA`) in gallery.js; no markup change.
