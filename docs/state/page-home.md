# Home page — state

`index.html` + `src/js/home.js`.

## Section order (top → bottom)
Promo bar (dismissible US-shipping message) → nav → glass hero (kicker "See through it. Never get through it.", H1 "The industry standard in Clear View security fencing.", `dusk.jpg`, 2×2 $ ticker chips, trust strip) → static category tiles (indexable, no JS — brief requirement) → best-sellers rail → client logo wall → SA stats bento → why cards → estimator teaser → **factory video duo** → shine promo band → full priced product grid with segment filter → duo tiles → ticker → factory card → SEO editorial block → FAQ tabs → footer + fence band. JSON-LD: Organization + FAQPage (US company framing).

## JS behaviors (home.js)
- Best-sellers rail: 8 ids `['panels','posts','caps','coils','spikes','gates','razormesh','clamps']` through `cardHTML`, `initRail` arrows.
- Priced grid: every product as `.buy-card` (hover `.alt` image, "From $…", Add button → `window.addToCart`, button flips to "Added" for 1.4 s). `initSeg('#segRange')` filter toggles `hidden` per `data-g` group.
- Logo wall: 6 real client logos in two alternating marquee rows, cards doubled for a seamless loop. Attributed to the **sister company** (see [content-rules.md](content-rules.md)).
- **Video duo**: `.vid-frame` figures with self-hosted `public/video/factory.mp4` (1.45 MB) + `factory-2.mp4` (886 KB) from the client's own @wireventures TikTok (`python -m yt_dlp`). Per-frame IntersectionObserver (threshold .35) play/pause; **exclusive sound** — unmuting one mutes all others and resets their pills; reduced-motion/saveData → native controls, no autoplay.
- FAQ tabs via `initSeg('#faqSeg')`; ticker via `initMarquee`.

## Tests (verified in headless Edge)
- Videos: scrolled into view → `[{paused:false,muted:true},{paused:false,muted:true}]`; after unmuting #2 → muted-states `[true,false]`; zero console errors.
- Grid Add → cart badge increments, toast fires; segment filter hides non-group cards.
- First-click `/#shop` scrolls (the Lenis anchor fix — regression test worth repeating on nav changes).

## Regressions fixed here
- Grid cards stuck on shimmer / hover showing 2nd image → per-image load listeners in `initImgFade` (delegated capture missed lazy imgs).
- Grid overlap from GSAP transform entrances → commerce grids use CSS `.rv` fade only.
- Home hero photo invisible at load → `playIfVisible` pattern (see [performance.md](performance.md)).
- Nav squeeze at laptop widths → short placeholder, `.btn--quote{flex:none}`, Contact dropped from home nav.
