# Shared chrome & widgets — state

All in `src/js/app.js`. `initCart()` is the one call every page makes — it wires the cart pill **and** calls the rest of the shared inits (search, image fade, curtain, promo bar, anchors, fence footer, nav pill, drawer, ripple, support). A page that only needs chrome (e.g. policies) imports and calls `initCart()` alone.

## Cart store
- `cartStore` on `sessionStorage` key `gm_cart_lines`; line shape `{id, t, unit, qty, img, spec}` with **unit in ZAR**.
- Global `window.addToCart(qty, item)` merges by id+spec, updates the pill, fires `toast()`. `window.refreshCart()` re-reads the store.
- Nav cart is a morphing pill: count badge, "View cart" main button, pay shortcut.

## Widgets (behavior + the regression that shaped each)
- **Support widget** (`initSupport`) — droplet FAB opening the frosted `.hsheet` enquiry form. Validation: contact field accepts email `/\S+@\S+\.\S+/` **or** phone `/^[+\d][\d\s()-]{6,}$/`; states amber `.warn` / green `.ok` with an `aria-live` status; droplet gauge fills `height = min(100, messageLength/5)%`; send disables and opens `mailto:info@fencing-supplier.com`; `.hs-done` splash on success. FAB bob animation pauses on hover/focus-visible (else it is unclickable in automation and annoying under a cursor).
- **Fence footer** (`initFenceFooter`) — the band is **re-parented to `document.body`** so no ancestor transform can capture its fixed positioning. Progress `p = clamp((h − (travel − scrollY))/h)`, `translateY((1−p)·100%)`, MIN = 0 and initial `translateY(100%)` — it must be fully hidden until the very end of the page (client: "this not stay for the whole time").
- **Anchors** (`initAnchors`) — same-page hashes via `lenis.scrollTo(el, {offset:-100})` + `pushState`. Native jumps get reverted by Lenis (the `/#shop` first-click bug).
- **Image fade** (`initImgFade`) — per-image load/error listeners (MutationObserver covers injected imgs); both load *and* error mark `.ok` so the shimmer always clears.
- **Curtain** (`initCurtain`) — fence-vector draw-on loader, lifts on ready. Must never be able to stick: any JS boot error on a page keeps it up, so page modules must not throw at top level (see the panels `sel.sz` regression in [page-panels.md](page-panels.md)).
- **Nav pill** (`initNavPill`), **drawer** (`initDrawer`, built from the page's own nav links, blur only when `.open`), **ripple** (`initRipple`, transform/opacity only), **toast** (water-drop slide-in), **promo bar** (`initPromoBar`, dismissible + remembered), **search** (`initSearch`, routes to `/products/?q=`), **seg control** (`initSeg`), **reveal + counters** (`initReveal`, the CSS `.rv` entrance used for commerce grids), `drawChart` (line chart — selector must be `$('.chart-wrap svg', card)`, a bare `svg` grabs the 13px trend icon), `initRail`, `initWipe`, `meshSVG` (358 mesh drawn to real geometry), `initMarquee`, `initHero`.

## Nav layout guards
Search placeholder kept short ("Search products…") with ellipsis overflow; `.nav-in > .btn--quote{flex:none}`; Contact link dropped from the home nav — all from the nav-squeeze regression at laptop widths.
