/* Home — commerce first, styled like the big first-party storefronts:
   promo bar, full-bleed photographic hero, display type, category tiles,
   a best-sellers carousel, promo band, the full priced range, and a loud
   ticker. Real photography only; motion is GSAP/Lenis via motion.js. */

import { initCart, initHero, initReveal, initSeg, initMarquee, initRail } from './app.js'
import { initMotion } from './motion.js'
import { PRODUCTS, byId, zar, ARROW, cardHTML, itemHref } from '../data/products.js'
import { CATEGORIES } from '../data/categories.js'

/* ── best sellers rail ────────────────────────────────────────── */
const BEST = ['panels', 'posts', 'caps', 'coils', 'spikes', 'gates', 'razormesh', 'clamps']
document.getElementById('rail').innerHTML = BEST.map(id => cardHTML(byId(id))).join('')
initRail('#rail', '#railPrev', '#railNext')

/* the shop-by-application tiles are static HTML now — the brief wants
   them indexable with no JS. This file only builds the priced grids. */

/* ── the range, priced, straight into the cart ────────────────── */
const grid = document.getElementById('grid')
grid.innerHTML = PRODUCTS.map(p => `
  <div class="buy-card" data-g="${p.g}">
    <a class="im" href="${itemHref(p.id)}"><img src="${p.gallery[0]}" alt="${p.t}" loading="lazy">${p.gallery[1] ? `<img class="alt" src="${p.gallery[1]}" alt="" loading="lazy">` : ''}</a>
    <div class="bd">
      <a class="t" href="${itemHref(p.id)}" style="text-decoration:none;color:inherit">${p.t}</a>
      <span class="plain">${p.plain}</span>
      <span class="ft">
        <span class="pr">${p.flat ? '' : 'From '}${zar(p.from)}</span>
        <button class="go" type="button" data-add="${p.id}">Add</button>
      </span>
    </div>
  </div>`).join('')

grid.addEventListener('click', (e) => {
  const b = e.target.closest('[data-add]')
  if (!b) return
  const p = byId(b.dataset.add)
  if (!p) return
  window.addToCart?.(1, { id: p.id, t: p.t, unit: p.from, img: p.gallery[0], spec: p.spec })
  b.textContent = 'Added'
  setTimeout(() => { b.textContent = 'Add' }, 1400)
})

initSeg('#segRange', (g) => {
  grid.querySelectorAll('.buy-card').forEach(c => {
    c.hidden = !(g === 'all' || c.dataset.g === g)
  })
})

/* ── recent projects — real roster from the factory site, rows
      drifting in alternating directions like the reference ──────── */
const CLIENTS = [
  ['PRASA', 'recent-project-prasa-320x120.jpg'],
  ['Newmont', 'recent-project-newmont-320x120.jpg'],
  ['Value Logistics', 'recent-valuegroup-project-320x120.jpg'],
  ['Sibanye-Stillwater', 'recent-sibanye-stillwater-project-320x120.jpg'],
  ['Steyn City', 'recent-steyn-city-project-320x120.jpg'],
  ['Clicks', 'recent-projects-clicks-320x120.jpg'],
]
const rowHTML = (list) => {
  const cards = list.map(([name, f]) =>
    `<span class="logo-card"><img src="/images/clients/${f}" alt="${name} logo" loading="lazy"></span>`).join('')
  return `<div class="rt">${cards}${cards}</div>`   // doubled for a seamless loop
}
const half = Math.ceil(CLIENTS.length / 2)
document.getElementById('logoWall').innerHTML =
  `<div class="logo-row">${rowHTML(CLIENTS.slice(0, half))}</div>
   <div class="logo-row logo-row--rev">${rowHTML(CLIENTS.slice(half))}</div>`

/* ── factory videos — muted autoplay while in view; unmuting one
      mutes the other; reduced-motion and data-saver get controls ── */
const vidFrames = document.querySelectorAll('.vid-frame')
if (vidFrames.length) {
  const still = matchMedia('(prefers-reduced-motion:reduce)').matches || navigator.connection?.saveData
  const resetSnd = () => document.querySelectorAll('.vid-snd').forEach(b => {
    b.classList.remove('on')
    b.querySelector('span').textContent = 'Sound'
    b.setAttribute('aria-label', 'Unmute video')
  })
  vidFrames.forEach(frame => {
    const v = frame.querySelector('video')
    if (still) {
      v.controls = true
    } else {
      new IntersectionObserver((es) => es.forEach(e => {
        e.isIntersecting ? v.play().catch(() => {}) : v.pause()
      }), { threshold: 0.35 }).observe(v)
    }
    const snd = frame.querySelector('.vid-snd')
    snd.addEventListener('click', () => {
      const unmuting = v.muted
      document.querySelectorAll('.vid-frame video').forEach(o => { o.muted = true })
      resetSnd()
      if (unmuting) {
        v.muted = false
        snd.classList.add('on')
        snd.querySelector('span').textContent = 'Mute'
        snd.setAttribute('aria-label', 'Mute video')
        if (v.paused) v.play().catch(() => {})
      }
    })
  })
}

/* ── FAQ tabs ─────────────────────────────────────────────────── */
initSeg('#faqSeg', (v) => {
  document.querySelectorAll('.faq-pane').forEach(p => { p.hidden = p.dataset.pane !== v })
})

/* ── ticker ───────────────────────────────────────────────────── */
initMarquee('#marq', [
  'Welded in Benoni South',
  '358 anti-climb mesh',
  'Four finish systems',
  'Every product priced',
  'Nationwide delivery',
])

initCart()
initHero()      // tagline line reveals
initReveal()    // .rv entrances
initMotion()    // Lenis + GSAP: split headings, rise groups
