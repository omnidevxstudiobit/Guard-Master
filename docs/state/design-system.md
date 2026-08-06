# Design system — state

Everything lives in `src/styles/app.css`. The settled direction (client approved): **liquid-glass / glassmorphism** — frosted panels, pastel blues/purples, bold storefront commerce (Nike/Adidas-style), real photography only, prices visible everywhere.

## Tokens & primitives
- `--gm-red: #e02126` — placeholder brand red until the client sends the official logo SVG hex. Drives `.btn--quote` (the red "Get a quote" CTA required by the brief) and the G-mark.
- `.card.glass` / `.glass--lit` — the frosted card primitives. Mini-total badge `.mini-tot` is yellow `rgba(250,204,21,.85)`.
- `.btn`, `.btn--go` (dark pill + arrow dot), `.btn--quote` (red, `flex:none` inside `.nav-in` so it never crushes).
- `.chip` / `.chips` — the shared configurator pills used by the panels builder and every PDP. **Option chip labels double as pricing keys** — never rename a label without updating `variant-prices.js`.
- `.pick` — droplet-style radio cards (support sheet, checkout fulfilment).
- `.seg` — glass segmented control with sliding pill (`initSeg`).
- `.buy-card` / `.pcard` — commerce cards; second gallery image as `.alt` cross-fades on hover.
- `.sk` skeletons + `:has(img:not(.ok))` shimmer — shimmer clears when `initImgFade` marks the img `.ok` (load **or** error).
- Curtain loader `.curtain`/`.c-fence` — fence-vector draw-on, lifts when the page is ready (`initCurtain`).
- Fence footer `.fence-foot{padding-bottom:44vh}` + `.fence-band` (z-60, starts `translateY(100%)`).
- Video frames `.vid-sec`/`.vid-duo`/`.vid-frame` — vertical `aspect-ratio:9/16`, `height:min(72vh,620px)` (duo: `min(56vh,520px)`), glass rim `::after`, `.vid-snd` sound pill, `.vid-tag` credit chip.
- Maps `.sa-grid`/`.sa-map`/`.city`/`.city--home`/`.city-info` — shared by the SA and US dot maps.

## Hard rules
- **Backdrop-filter only at rest or on open overlays.** Nav frost swaps to solid while `body.scrolling`; the drawer gets blur only when `.open`; buttons never get it. See [performance.md](performance.md) for the measurements behind this.
- Aurora `.blob`s are radial-gradients (not `filter:blur`) and get `opacity:0; visibility:hidden` while `body.scrolling`.
- Animate **transform/opacity only**. Never transform sticky containers or full-page wrappers.
- `.sticky-sec{padding:0}` — the generic `section` padding must not leak into sticky scenes.
- `.slide[hidden]{display:none}` — any element whose base display is set by a class needs an explicit `[hidden]` override or filtering silently breaks.

## Accessibility fallbacks (implemented, keep them)
- `@media (prefers-reduced-transparency: reduce), (prefers-contrast: more)` → glass goes solid white.
- `@supports not (backdrop-filter: blur(10px))` → solid fallback backgrounds.
- `prefers-reduced-motion` honoured in JS: hero/deck/orbit animations become static, videos get native controls instead of autoplay.
- `.hfab:hover, .hfab:focus-visible { animation-play-state: paused }` — the FAB bob pauses so it is clickable/testable (Playwright "element is not stable" fix).
- Print styles produce a clean spec sheet from the PDP (`printSpec` → `window.print()`).

## Category accents
`src/data/categories.js` — four audience pills (Home & Estate, Commercial, High Security, Gates). Accent hexes are computed to carry white text at ≥7:1 AA. Category pages set `--a` from `cat.accent`.
