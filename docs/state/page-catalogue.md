# Catalogue page — state

`products/index.html` + `src/js/catalog.js`. Horizontal slide deck of all 12 products (Jitter-reference design, reimplemented as original code).

## Standard implementation
- `slideHTML(p)` renders each product as a full `.slide` link → `itemHref(p.id)`: figure, shield mark, kicker by group (`clearview`/`razor`/else accessories), description, tags, "From $…" price, spec.
- Active slide = the one whose centre is nearest the track's viewport centre (`sync()` uses `getBoundingClientRect`, so it's scroll-position independent). Updates `01 / 12` index, progress bar width, prev/next disabled states.
- Navigation: arrow buttons and ←/→ keys call `go(i)` → `scrollIntoView({inline:'center', block:'nearest'})` (block:'nearest' keeps the page from jumping vertically).
- Drag-to-pan for mouse only (`pointerType === 'touch'` returns early so native touch scroll wins); a drag > 4 px sets `moved` and a capture-phase click handler cancels the link navigation.
- Filtering: group segment (`initSeg('#segCat')`) × live text query (`#q` input, also seeded from `?q=` — every nav search box routes here). `apply()` sets `hidden`, resets scroll to 0, `requestAnimationFrame(sync)`.
- `sync` re-runs on debounced track scroll (60 ms), window resize, and window load (images settling shift the centre).

## Tests (verified)
- Filter by group hides non-matching slides; index/progress renumber to the visible subset.
- Nav search from another page lands with the query applied and the field prefilled.
- Drag then release re-centres the nearest slide and does not navigate.

## Regressions fixed
- **Filter didn't hide slides**: `.slide{display:grid}` outranked the `hidden` attribute → explicit `.slide[hidden]{display:none}` in app.css. General rule recorded in [design-system.md](design-system.md).
