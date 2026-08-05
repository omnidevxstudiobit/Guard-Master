/* Gallery — two views, both in continuous motion like the references.

   Orbit: category cards travel slowly along a convex arc, tilted tangent
   to the curve, wrapping offscreen. Hover pauses the orbit; picking a
   card opens its category.

   Focus gallery: one frame focused centre-stage, neighbours peeking at
   the edges. It auto-advances through the centre, pauses while you're
   on it, and the centre frame leans toward the pointer. */

import { gsap } from 'gsap'
import { initCart, initHero } from './app.js'
import { initMotion } from './motion.js'
import { CATEGORIES, catById } from '../data/categories.js'
import { byId } from '../data/products.js'

const $ = s => document.querySelector(s)
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches

/* one strong image per category for the orbit */
const CAT_IMG = {
  'home-estate': '/images/estate/dusk.jpg',
  'commercial': '/images/products/clear-view-fencing-panels/clear-view-fencing-commercial-property-high-security-fencing-600x442-600.webp',
  'high-security': '/images/products/razor-wire-mesh/img-6277-960.webp',
  'gates': '/images/products/accessories/sliding-gate-galvanized-clear-view-mesh-filling-reinforced-intermedia-spikes-600x442-600.webp',
}
/* the client-supplied photography leads the Home & Estate set */
const EXTRA = {
  'home-estate': ['/images/estate/dusk.jpg', '/images/estate/header.jpg',
                  '/images/estate/lifestyle.jpg', '/images/estate/landscape.jpg'],
}

const photosFor = (cat) => {
  const seen = new Set(EXTRA[cat.id] || [])
  cat.products.forEach(id => (byId(id)?.gallery || []).forEach(src => seen.add(src)))
  return [...seen].slice(0, 12)
}

/* ══ view 1 · the orbit ═══════════════════════════════════════════ */
const orbit = $('#orbit')
orbit.innerHTML = CATEGORIES.map(c => `
  <button class="orb-card" type="button" data-id="${c.id}" style="--a:${c.accent}">
    <span class="in">
      <img src="${CAT_IMG[c.id]}" alt="${c.name}">
      <span class="lbl"><b>${c.name}</b><span>${photosFor(c).length} photographs</span></span>
    </span>
  </button>`).join('')

const cards = Array.from(orbit.children)
const N = cards.length
let rect = orbit.getBoundingClientRect()
addEventListener('resize', () => { rect = orbit.getBoundingClientRect() })

/* cards live on a parabola: highest at centre, falling and tilting
   toward the edges, fading out just before they wrap */
function place (card, xn) {
  const x = xn * rect.width
  const y = 130 * xn * xn * 4
  const r = xn * 26
  const edge = Math.abs(xn)
  const alpha = edge > 0.42 ? Math.max(0, 1 - (edge - 0.42) / 0.1) : 1
  card.style.transform = `translate(calc(-50% + ${x.toFixed(1)}px), ${y.toFixed(1)}px) rotate(${r.toFixed(2)}deg)`
  card.style.opacity = alpha.toFixed(3)
  card.style.zIndex = String(Math.round(100 - edge * 100))
  card.style.pointerEvents = alpha > 0.5 ? 'auto' : 'none'
}

const loop = { t: 0 }
function layout () {
  cards.forEach((card, i) => {
    const p = (loop.t + i / N) % 1               // 0..1 around the orbit
    place(card, p * 1.08 - 0.54)                 // wraps just offscreen
  })
}

let orbitTween = null
if (reduce) {
  /* static fan for reduced motion */
  cards.forEach((card, i) => place(card, (i / (N - 1)) * 0.76 - 0.38))
} else {
  layout()
  orbitTween = gsap.to(loop, { t: 1, duration: 34, ease: 'none', repeat: -1, onUpdate: layout })
  orbit.addEventListener('pointerenter', () => gsap.to(orbitTween, { timeScale: 0, duration: .5 }))
  orbit.addEventListener('pointerleave', () => gsap.to(orbitTween, { timeScale: 1, duration: .8 }))
}

orbit.addEventListener('click', (e) => {
  const card = e.target.closest('.orb-card')
  if (card) location.hash = card.dataset.id
})

/* ══ view 2 · the focus gallery ═══════════════════════════════════ */
const stage = $('#gvStage')
let photos = [], idx = 0, autoTimer = null, current = null

/* like the reference: centre sharp in its glass mat, sides blurred + dim */
const slot = (o) => o === 0
  ? { xPercent: -50, scale: 1, opacity: 1, zIndex: 5, filter: 'blur(0px)' }
  : Math.abs(o) === 1
    ? { xPercent: -50 + o * 118, scale: .78, opacity: .55, zIndex: 3, filter: 'blur(5px)' }
    : { xPercent: -50 + Math.sign(o) * 220, scale: .68, opacity: 0, zIndex: 1, filter: 'blur(9px)' }

function paint (animate = true) {
  Array.from(stage.children).forEach((el, i) => {
    let o = i - idx
    /* keep offsets in wrap-around range so neighbours come from the near side */
    if (o > photos.length / 2) o -= photos.length
    if (o < -photos.length / 2) o += photos.length
    const to = { ...slot(Math.max(-2, Math.min(2, o))), duration: animate && !reduce ? .75 : 0, ease: 'power3.inOut' }
    gsap.to(el, to)
    el.classList.toggle('focus', o === 0)     // the glass mat lives on the centre card
    el.style.pointerEvents = Math.abs(o) === 1 ? 'auto' : o === 0 ? 'auto' : 'none'
  })
  $('#gvCount').textContent = `${String(idx + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`
  document.querySelectorAll('#gvDots i').forEach((d, i) => d.classList.toggle('on', i === idx))
}

const go = (i, animate = true) => { zoomed = false; idx = (i + photos.length) % photos.length; paint(animate) }

/* the reference's click beat: the centre frame zooms in, sides fall away */
let zoomed = false
function toggleZoom () {
  const el = stage.children[idx]
  if (!el) return
  zoomed = !zoomed
  stopAuto()
  const sides = Array.from(stage.children).filter((_, i) => i !== idx)
  if (zoomed) {
    gsap.to(el, { scale: 1.15, duration: .7, ease: 'power3.inOut' })
    gsap.to(sides, { opacity: 0, duration: .5 })
  } else {
    paint()
    startAuto()
  }
}

function startAuto () {
  stopAuto()
  if (!reduce) autoTimer = setInterval(() => go(idx + 1), 3800)
}
function stopAuto () { if (autoTimer) { clearInterval(autoTimer); autoTimer = null } }

function openCat (cat) {
  current = cat
  photos = photosFor(cat)
  document.documentElement.style.setProperty('--a', cat.accent)
  $('#gvKick').textContent = 'Gallery'
  $('#gvTitle').textContent = cat.name
  $('#gvShop').href = cat.href
  stage.innerHTML = photos.map(src => `<figure class="gv-card"><img src="${src}" alt="${cat.name} photograph"></figure>`).join('')
  $('#gvDots').innerHTML = photos.map(() => '<i></i>').join('')

  $('#orbitView').hidden = true
  $('#galleryView').hidden = false
  idx = 0
  paint(false)
  if (!reduce) gsap.from('#galleryView', { opacity: 0, y: 26, duration: .6, ease: 'power3.out' })
  startAuto()
}

function closeCat () {
  stopAuto()
  $('#galleryView').hidden = true
  $('#orbitView').hidden = false
  if (!reduce) gsap.from('#orbitView', { opacity: 0, y: 26, duration: .6, ease: 'power3.out' })
}

/* controls — any interaction pauses the auto-play for a while */
const nudge = (fn) => { stopAuto(); fn(); startAuto() }
$('#gvNext').addEventListener('click', () => nudge(() => go(idx + 1)))
$('#gvPrev').addEventListener('click', () => nudge(() => go(idx - 1)))
$('#gvDots').addEventListener('click', (e) => {
  const dots = Array.from(document.querySelectorAll('#gvDots i'))
  const i = dots.indexOf(e.target)
  if (i >= 0) nudge(() => go(i))
})
stage.addEventListener('click', (e) => {
  const el = e.target.closest('.gv-card')
  if (!el) return
  const i = Array.from(stage.children).indexOf(el)
  if (i === idx) toggleZoom()
  else nudge(() => go(i))
})
stage.addEventListener('pointerenter', stopAuto)
stage.addEventListener('pointerleave', startAuto)
addEventListener('keydown', (e) => {
  if ($('#galleryView').hidden) return
  if (e.key === 'ArrowRight') nudge(() => go(idx + 1))
  if (e.key === 'ArrowLeft') nudge(() => go(idx - 1))
  if (e.key === 'Escape') { if (zoomed) toggleZoom(); else location.hash = '' }
})
$('#gvBack').addEventListener('click', () => { location.hash = '' })

/* the centre frame leans toward the pointer */
if (!reduce) {
  stage.addEventListener('pointermove', (e) => {
    const el = stage.children[idx]
    if (!el) return
    const r = stage.getBoundingClientRect()
    gsap.to(el, {
      x: ((e.clientX - r.left) / r.width - .5) * 14,
      y: ((e.clientY - r.top) / r.height - .5) * 10,
      duration: .8, ease: 'power3',
    })
  })
  stage.addEventListener('pointerleave', () => {
    const el = stage.children[idx]
    if (el) gsap.to(el, { x: 0, y: 0, duration: .8, ease: 'power3' })
  })
}

/* ── hash routing: #home-estate opens that set, back closes ─────── */
function route () {
  const cat = catById(location.hash.slice(1))
  if (cat) openCat(cat)
  else closeCat()
}
addEventListener('hashchange', route)

initCart()
initHero()
initMotion()
if (location.hash.slice(1)) route()
