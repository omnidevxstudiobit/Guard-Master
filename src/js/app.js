/* ==========================================================================
   Guard Master — shared behaviour
   Motion primitives rebuilt from the Jitter references:
   tagline stagger, glass segmented control, drawing line chart,
   social pop-in, product rail, and the before/after wipe.
   ========================================================================== */

const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches
const $  = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s))

/* ── cart ─────────────────────────────────────────────────────────
   The split state is not a flourish — it IS the "cart has items"
   state. Empty shows the pill; the moment anything is in the cart the
   checkout and item-count circles stay out, and all three are live
   controls that route to the cart page. */
const CART_URL = '/cart/'
const onCartPage = () => location.pathname.replace(/\/+$/, '') === '/cart'

/* One cart shared by every page, so the badge and the order list can
   never disagree. sessionStorage is deliberate — a browsing session,
   not a permanent basket. */
export const cartStore = {
  read () {
    try { return JSON.parse(sessionStorage.getItem('gm_cart_lines') || '[]') } catch { return [] }
  },
  write (lines) {
    sessionStorage.setItem('gm_cart_lines', JSON.stringify(lines))
    sessionStorage.setItem('gm_cart_count', String(cartStore.count(lines)))
  },
  count (lines = cartStore.read()) {
    return lines.reduce((s, l) => s + l.qty, 0)
  },
  add (item, qty = 1) {
    const lines = cartStore.read()
    const hit = lines.find(l => l.t === item.t)
    if (hit) hit.qty += qty
    else lines.push({ ...item, qty })
    cartStore.write(lines)
    return lines
  },
  clear () { cartStore.write([]) },
}

export function initCart () {
  const cart = $('#cart')
  if (!cart) return

  const count = $('#cartCount', cart)
  const main = $('#cartMain', cart)
  const pay = $('.c-pay', cart)

  const paint = () => {
    const n = cartStore.count()
    if (count) {
      count.textContent = n
      count.setAttribute('aria-label', `${n} item${n === 1 ? '' : 's'} in cart — view cart`)
    }
    // drives the morph: pill when empty, three circles when not
    cart.dataset.open = n > 0 ? 'true' : 'false'
  }

  const goCart = () => {
    if (onCartPage()) {
      document.getElementById('lines')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      location.href = CART_URL
    }
  }

  // all three circles route to the cart
  main?.addEventListener('click', goCart)
  pay?.addEventListener('click', goCart)
  count?.addEventListener('click', goCart)

  /* item is required — every line carries a real numeric `unit` price so
     the cart and checkout can always total. Callers must pass one. */
  window.addToCart = (qty = 1, item = null) => {
    if (!item || typeof item.unit !== 'number') {
      console.warn('addToCart needs an item with a numeric `unit` price'); return
    }
    cartStore.add(item, qty)
    paint()
  }
  window.refreshCart = paint

  paint()
  initSearch()   // every page with a nav gets a working search
  initImgFade()  // shimmer under every product image until it lands
  initCurtain()  // branded preloader, where the page carries one
  initPromoBar() // dismissible announcement, per the brief
  initAnchors()  // in-page anchors must go through Lenis, or it fights the jump
  initFenceFooter() // the fence rises from the floor at the end of the page
}

/* ── fence footer — a viewport-pinned fence rises out of the floor
      over the last band-height of scroll, standing fully at the end
      of the page. Mechanic adapted from the Ruixen gradient footer
      (scroll-remaining → progress → transform); rendered as our own
      Clear View line-art instead of a glow. Transform-only. ──────── */
export function initFenceFooter () {
  const band = document.getElementById('fenceBand')
  if (!band) return
  const MIN = 0.08                       // cap tips peek above the floor at rest
  let travel = 0
  const measure = () => {
    travel = document.documentElement.scrollHeight - window.innerHeight
  }
  let queued = false
  const update = () => {
    queued = false
    const h = band.offsetHeight || 1
    const leftToScroll = travel - (window.scrollY || 0)
    const t = Math.max(0, Math.min(1, (h - leftToScroll) / h))
    const p = MIN + (1 - MIN) * t
    band.style.transform = `translateY(${((1 - p) * 100).toFixed(2)}%)`
  }
  const onScroll = () => { if (!queued) { queued = true; requestAnimationFrame(update) } }
  measure(); update()
  addEventListener('scroll', onScroll, { passive: true })
  addEventListener('resize', () => { measure(); onScroll() }, { passive: true })
  addEventListener('load', () => { measure(); onScroll() })   // late images change page height
}

/* ── same-page anchors — Lenis reverts native hash jumps, so drive
      the scroll through it (with a native fallback) ─────────────── */
export function initAnchors () {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"], a[href^="/#"]')
    if (!a) return
    const href = a.getAttribute('href')
    if (href.startsWith('/#') && location.pathname !== '/') return   // cross-page: navigate normally
    const id = href.replace(/^\/?#/, '')
    const el = id && document.getElementById(id)
    if (!el) return
    e.preventDefault()
    history.pushState(null, '', '#' + id)
    if (window.lenis) window.lenis.scrollTo(el, { offset: -100 })    // clear the sticky nav
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

/* ── announcement bar: dismissible, remembered ────────────────── */
export function initPromoBar () {
  const bar = document.querySelector('.promo-bar')
  if (!bar) return
  try { if (localStorage.getItem('gm_pb_hide')) return bar.remove() } catch {}
  bar.querySelector('#pbClose')?.addEventListener('click', () => {
    try { localStorage.setItem('gm_pb_hide', '1') } catch {}
    bar.remove()
  })
}

/* ── image loading: mark images as they land so the shimmer under
      them releases and they fade in. Every image gets its own
      listener (wired on injection via MutationObserver) — delegated
      capture proved unreliable for lazy-loaded grid images. ──────── */
export function initImgFade () {
  const mark = (img) => img.classList.add('ok')
  const wire = (img) => {
    if (img.dataset.okWired) return
    img.dataset.okWired = '1'
    if (img.complete && img.naturalWidth) return mark(img)
    img.addEventListener('load', () => mark(img), { once: true })
    img.addEventListener('error', () => mark(img), { once: true })   // a broken image must not shimmer forever
  }
  const wireAll = () => $$('img').forEach(wire)
  wireAll()
  new MutationObserver(wireAll).observe(document.body, { childList: true, subtree: true })
}

/* ── the curtain: shield mark + shimmer bar, lifts when the page is
      ready (or after 3s, whichever comes first) ────────────────── */
export function initCurtain () {
  const c = document.getElementById('curtain')
  if (!c) return
  const done = () => {
    if (c.dataset.done) return
    c.dataset.done = '1'
    c.classList.add('done')
    setTimeout(() => c.remove(), 800)
  }
  if (document.readyState === 'complete') setTimeout(done, 250)
  else addEventListener('load', () => setTimeout(done, 250))
  setTimeout(done, 3000)
}

/* ── search — routes into the catalogue's live filter ─────────── */
export function initSearch () {
  $$('.search').forEach(box => {
    const input = box.querySelector('input[type="search"]')
    if (!input || input.id === 'q') return   // the catalogue filters in place
    const go = () => {
      const q = input.value.trim()
      location.href = '/products/' + (q ? '?q=' + encodeURIComponent(q) : '')
    }
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') go() })
    box.querySelector('button')?.addEventListener('click', (e) => { e.preventDefault(); go() })
  })
}

/* ── glass segmented control, sliding pill ────────────────────── */
export function initSeg (root, onChange) {
  const el = typeof root === 'string' ? $(root) : root
  if (!el) return
  const pill = $('.pill', el)
  const btns = $$('button', el)

  const move = (b) => {
    if (!pill) return
    pill.style.width = b.offsetWidth + 'px'
    pill.style.transform = `translateX(${b.offsetLeft - 6}px)`
  }
  const select = (b) => {
    btns.forEach(x => x.setAttribute('aria-selected', String(x === b)))
    move(b)
    onChange && onChange(b.dataset.value ?? b.textContent.trim(), b)
  }

  btns.forEach(b => b.addEventListener('click', () => select(b)))
  const active = btns.find(b => b.getAttribute('aria-selected') === 'true') || btns[0]
  if (active) requestAnimationFrame(() => select(active))
  addEventListener('resize', () => {
    const cur = btns.find(b => b.getAttribute('aria-selected') === 'true')
    if (cur) move(cur)
  })
}

/* ── scroll reveal + counters ─────────────────────────────────── */
export function initReveal () {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return
      e.target.classList.add('in')
      io.unobserve(e.target)
      if (e.target.matches('[data-count]')) countUp(e.target)
      if (e.target.matches('.socials, .tagline')) e.target.classList.add('go')
      $$('.socials, .tagline', e.target).forEach(n => n.classList.add('go'))
      if (e.target.dataset.chart) drawChart(e.target)
    })
  }, { threshold: 0.14, rootMargin: '0px 0px -6% 0px' })

  $$('.rv').forEach((n, i) => {
    n.style.transitionDelay = (i % 3) * 70 + 'ms'
    io.observe(n)
  })
  // observed directly — counters and charts are not always inside a .rv wrapper
  $$('[data-chart]').forEach(n => io.observe(n))
  $$('[data-count]').forEach(n => io.observe(n))
}

function countUp (node) {
  const to = parseFloat(node.dataset.count)
  const dp = parseInt(node.dataset.dp || '0', 10)
  const suffix = node.dataset.suffix || ''
  if (reduce) { node.textContent = to.toFixed(dp) + suffix; return }
  let t0 = null
  const step = (t) => {
    if (t0 === null) t0 = t
    const k = Math.min(1, (t - t0) / 1400)
    const e = 1 - Math.pow(1 - k, 3)
    node.textContent = (to * e).toFixed(dp).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + suffix
    if (k < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

/* ── line chart, drawn left to right ──────────────────────────── */
export function drawChart (card) {
  /* the card also holds a tiny trend-icon svg — draw into the chart's own */
  const svg = $('.chart-wrap svg', card)
  if (!svg || svg.dataset.drawn) return
  svg.dataset.drawn = '1'

  const pts = JSON.parse(card.dataset.chart)
  const W = 560, H = 190, PAD = 14
  const max = Math.max(...pts) * 1.45
  const stepX = (W - PAD * 2) / (pts.length - 1)
  const y = v => H - PAD - (v / max) * (H - PAD * 2)

  // smooth path through the points
  let d = `M ${PAD} ${y(pts[0])}`
  for (let i = 0; i < pts.length - 1; i++) {
    const x0 = PAD + i * stepX, x1 = PAD + (i + 1) * stepX
    const cx = (x0 + x1) / 2
    d += ` C ${cx} ${y(pts[i])}, ${cx} ${y(pts[i + 1])}, ${x1} ${y(pts[i + 1])}`
  }

  const grid = [0, 0.33, 0.66, 1]
    .map(g => `<line x1="${PAD}" y1="${PAD + g * (H - PAD * 2)}" x2="${W - PAD}" y2="${PAD + g * (H - PAD * 2)}"
               stroke="rgba(20,18,26,.16)" stroke-width="1" stroke-dasharray="3 5"/>`).join('')

  const lastX = PAD + (pts.length - 1) * stepX, lastY = y(pts[pts.length - 1])

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
  svg.innerHTML = `${grid}
    <path id="ln" d="${d}" fill="none" stroke="#14121a" stroke-width="2.4" stroke-linecap="round"/>
    <line x1="${lastX}" y1="${lastY}" x2="${lastX}" y2="${H - PAD}" stroke="rgba(20,18,26,.4)" stroke-width="1" stroke-dasharray="3 4" opacity="0"/>
    <circle cx="${lastX}" cy="${lastY}" r="4" fill="#fff" stroke="#14121a" stroke-width="2" opacity="0"/>`

  const path = $('#ln', svg)
  const len = path.getTotalLength()
  const marks = [svg.querySelector('line[stroke-dasharray="3 4"]'), svg.querySelector('circle')]

  if (reduce) { marks.forEach(m => m.setAttribute('opacity', '1')); return }

  path.style.strokeDasharray = len
  path.style.strokeDashoffset = len
  path.getBoundingClientRect()
  path.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(.22,1,.36,1)'
  path.style.strokeDashoffset = '0'
  setTimeout(() => marks.forEach(m => {
    m.style.transition = 'opacity .5s ease'
    m.setAttribute('opacity', '1')
  }), 1250)
}

/* ── product rail ─────────────────────────────────────────────── */
export function initRail (railSel, prevSel, nextSel) {
  const rail = $(railSel)
  if (!rail) return
  const by = () => (rail.querySelector('.pcard:not([hidden])')?.offsetWidth || 300) + 16
  $(prevSel)?.addEventListener('click', () => rail.scrollBy({ left: -by(), behavior: 'smooth' }))
  $(nextSel)?.addEventListener('click', () => rail.scrollBy({ left: by(), behavior: 'smooth' }))
}

/* ── before / after wipe ──────────────────────────────────────── */
export function initWipe (sel) {
  const wipe = $(sel)
  if (!wipe) return
  const plate = $('.plate', wipe)
  const bar = $('.bar', wipe)
  let dragging = false, auto = true

  const set = (pct) => {
    pct = Math.max(0, Math.min(100, pct))
    plate.style.clipPath = `inset(0 ${100 - pct}% 0 0)`
    bar.style.left = pct + '%'
  }
  const at = (e) => {
    const r = wipe.getBoundingClientRect()
    set(((e.clientX - r.left) / r.width) * 100)
  }

  wipe.addEventListener('pointerdown', (e) => {
    dragging = true; auto = false
    wipe.setPointerCapture(e.pointerId); at(e)
  })
  wipe.addEventListener('pointermove', (e) => { if (dragging) at(e) })
  wipe.addEventListener('pointerup', () => { dragging = false })
  wipe.addEventListener('pointercancel', () => { dragging = false })

  if (reduce) { set(52); return }
  set(100)
  const io = new IntersectionObserver((es) => {
    es.forEach(e => {
      if (!e.isIntersecting || !auto) return
      io.disconnect()
      let t0 = null
      const step = (t) => {
        if (!auto) return
        if (t0 === null) t0 = t
        const k = Math.min(1, (t - t0) / 2000)
        set(100 - (1 - Math.pow(1 - k, 3)) * 46)
        if (k < 1) requestAnimationFrame(step)
      }
      setTimeout(() => requestAnimationFrame(step), 420)
    })
  }, { threshold: 0.35 })
  io.observe(wipe)
  return { set }
}

/* ── 358 mesh, drawn to real geometry ─────────────────────────── */
export function meshSVG (w, h, apertureMM, opts = {}) {
  const PANEL_W = 3000            // a real panel is 3m wide
  const pitchX = 76.2
  // opts.scale is px-per-mm and is what callers should pass when the drawing
  // has to be geometrically true; opts.zoom is the loose fallback.
  const scale = opts.scale != null ? opts.scale : (w / PANEL_W) * (opts.zoom || 1)
  const dx = pitchX * scale, dy = apertureMM * scale
  let s = `<g stroke="${opts.stroke || 'rgba(20,18,26,.55)'}" stroke-width="${opts.sw || 1}">`
  for (let x = 0; x <= w; x += dx) s += `<line x1="${x.toFixed(1)}" y1="0" x2="${x.toFixed(1)}" y2="${h}"/>`
  for (let y = 0; y <= h; y += dy) s += `<line x1="0" y1="${y.toFixed(1)}" x2="${w}" y2="${y.toFixed(1)}"/>`
  return s + '</g>'
}

/* ── marquee ──────────────────────────────────────────────────── */
export function initMarquee (sel, items) {
  const el = $(sel)
  if (!el) return
  el.innerHTML = `<span>${items.join('</span><span>')}</span>`.repeat(2)
}

/* ── hero intro ───────────────────────────────────────────────── */
export function initHero () {
  requestAnimationFrame(() => requestAnimationFrame(() => {
    $$('.tagline').forEach(t => t.classList.add('go'))
    $$('.hero-card').forEach(c => c.classList.add('go'))
    $$('.socials').forEach(s => s.classList.add('go'))
  }))
}
