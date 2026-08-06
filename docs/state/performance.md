# Performance & motion — state

The site went through two "website feels so laggy" crises. Every rule here was earned by **measuring** (rAF-counter fps probes in the headless browser), then bisecting, then gating — never by deleting features. The client's standing instruction: *"the scroll should be smooth, but do not remove any features."*

## Measured history (don't re-litigate)
| Change | Measurement |
|---|---|
| Baseline glass everywhere | ~7 fps scrolling |
| Removed backdrop-filter from buttons, blobs → radial-gradients, band drift → transform on `::after` | ~30 fps |
| ReactBits velocity page-skew (transform on a full-page-height wrapper) | 30 → **3 fps** — removed; finding documented in a comment in `motion.js` |
| Aurora blobs left visible while scrolling | ~16 fps — now `opacity:0; visibility:hidden` under `body.scrolling` |
| Closed drawer still carrying backdrop-filter | ~5 fps — blur now applied only on `.open` |

## The scroll pipeline
- Lenis (`lerp: 0.1`) initialised in `motion.js`; it also flags `body.scrolling` and clears it on a **160 ms idle timer**. That class is the master gate: nav frost → solid, blobs hidden, decorative loops paused.
- Nav "frost-at-rest": blur when idle, `body.scrolling .nav-in { backdrop-filter:none; background: <solid> }` while moving. This is the client-approved compromise ("I LIKED PREV NAVBAR BUT NEED WITHOUT LAGGY").
- All pointer FX (card tilt `perspective(900px) rotateX/Y ±7°`, spotlight vars, dock magnify) share **one delegated, rAF-throttled listener**, gated to `(hover:hover)` devices — `initPointerFX` in `motion.js`.
- Same-page anchors go through `lenis.scrollTo(el, {offset:-100})` + `pushState` (`initAnchors`) because Lenis reverts native hash jumps — this fixed the dead first click on `/#shop` in production.

## GSAP gotchas (each one bit us)
- **One-shot triggers stuck at opacity 0** for elements already in view at load: clamped `start` never crosses. Every one-shot uses `playIfVisible`:
  `onRefresh: (self) => { if (self.scroll() >= self.start && self.animation?.progress() === 0) self.animation.play() }`
- Commerce grids (`.buy-card` blocks) are **off GSAP entirely** — CSS `.rv` fade via `initReveal`, because transform entrances caused overlap on lazy-image layout shift.
- SplitText needs a wide-enough container: `.stage-copy` was `36ch` (=330px, one word per line) → `max-width:min(62%,620px)`.
- Never transform sticky boxes or page wrappers (see velocity-skew above; also why the fence band is re-parented to `document.body`).

## Media rules
- Videos: muted in-view autoplay via IntersectionObserver (threshold .35), paused off-screen; `prefers-reduced-motion` / `saveData` → native controls, no autoplay. Home videos budget ≤ ~1.5 MB each (brief).
- Images: lazy + `initImgFade` per-image load/error listeners (wired by MutationObserver so late-injected imgs are covered). A delegated window-capture 'load' listener **misses lazy images** — that regression is why it's per-image.
