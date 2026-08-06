# Category pages — state

`home-estate/index.html` + `src/js/category.js` (generic) + `src/data/categories.js`.

## Standard implementation
- `category.js` is fully generic: it reads `document.body.dataset.cat`, looks up `catById()`, and throws on an unknown id (fail loud, not blank). The category's `accent` is written to CSS var `--a` (drives the header wash); `blurb` fills `#catBlurb`.
- Buy grid built from `cat.products` ids → shared `.buy-card` markup (hover `.alt` image, "From $…", Add → `window.addToCart`, 1.4 s "Added" flip).
- **Finishes as swatches** (`cat.finishes`): coatings are colours, not photos — gradient swatch buttons with `aria-pressed`, note card swaps title/description. Only Home & Estate defines finishes today.
- Entrances are CSS `.rv` fades via `initReveal` — **the buy grid must stay off GSAP transforms** (overlap regression, see [performance.md](performance.md)).

## Data (`categories.js`)
Four pills split **by audience, not component** (a homeowner shops for "a fence for my house", not "a post"): home-estate, commercial, high-security, gates. Accent hexes documented in-file with their white-text contrast ratios (all ≥7:1). Only `home-estate` has a dedicated page; the other three currently link to `/products/`.

## Tests (verified)
- `/home-estate/` renders the estate photo set (client's own, watermark-cropped), swatch clicks swap the finish note, Add buttons land lines in the cart.
- Unknown `data-cat` throws visibly in console (by design).

## Open items
- Dedicated pages for commercial / high-security / gates when the client wants them: copy the home-estate HTML shell, set `data-cat`, add to vite inputs (see [architecture.md](architecture.md)). The JS and data layer already support it — commercial/high-security/gates just need `finishes` arrays if swatches are wanted.
