import { initCart, initSeg, initHero } from './app.js'
import { PRODUCTS, zar, itemHref } from '../data/products.js'

const track = document.getElementById('track')
const idxEl = document.getElementById('idx')
const progEl = document.getElementById('prog')
const prevBtn = document.getElementById('prev')
const nextBtn = document.getElementById('next')

let group = 'all'
/* arrive from any nav search box with ?q= */
let query = (new URLSearchParams(location.search).get('q') || '').trim().toLowerCase()
let active = 0
if (query) {
  const q = document.getElementById('q')
  if (q) q.value = query
}

const MARK = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 4.6 6.2v5.4c0 4.6 3.1 8.4 7.4 9.4 4.3-1 7.4-4.8 7.4-9.4V6.2Z"/></svg>`
const ARROW = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>`

function slideHTML (p, i) {
  return `<a class="slide" data-g="${p.g}" data-name="${p.t.toLowerCase()}" href="${itemHref(p.id)}">
    <figure class="fig"><img src="${p.gallery[0]}" alt="${p.t}" loading="${i < 2 ? 'eager' : 'lazy'}"></figure>
    <div class="body">
      <span class="mark">${MARK}</span>
      <span class="kicker">${p.g === 'clearview' ? 'Clear View system' : p.g === 'razor' ? 'Razor wire' : 'Accessories & fixings'}</span>
      <h2>${p.t}</h2>
      <p class="desc">${p.d}</p>
      <div class="tags">${p.tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>
      <div class="foot">
        <span class="price">${p.flat ? '' : 'From '}${zar(p.from)}</span>
        <span class="spec">${p.spec}</span>
        <span class="icon-btn" style="margin-left:auto" aria-hidden="true">${ARROW}</span>
      </div>
    </div>
  </a>`
}

track.innerHTML = PRODUCTS.map(slideHTML).join('')

const slides = () => Array.from(track.children).filter(s => !s.hidden)

/* ── which slide is nearest the centre of the viewport ───────── */
function sync () {
  const vis = slides()
  if (!vis.length) return
  // viewport-relative, so it stays correct regardless of scroll or offsetParent
  const box = track.getBoundingClientRect()
  const mid = box.left + box.width / 2
  let best = 0, bestD = Infinity
  vis.forEach((s, i) => {
    const r = s.getBoundingClientRect()
    const d = Math.abs(r.left + r.width / 2 - mid)
    if (d < bestD) { bestD = d; best = i }
  })
  active = best
  Array.from(track.children).forEach(s => s.classList.remove('is-active'))
  vis[active].classList.add('is-active')

  idxEl.textContent = `${String(active + 1).padStart(2, '0')} / ${String(vis.length).padStart(2, '0')}`
  progEl.style.width = ((active + 1) / vis.length * 100) + '%'
  prevBtn.disabled = active === 0
  nextBtn.disabled = active === vis.length - 1
}

function go (i) {
  const vis = slides()
  const s = vis[Math.max(0, Math.min(vis.length - 1, i))]
  // inline:'center' does the centring maths; block:'nearest' keeps the page still
  s?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
}

prevBtn.addEventListener('click', () => go(active - 1))
nextBtn.addEventListener('click', () => go(active + 1))

track.addEventListener('scroll', () => {
  clearTimeout(track._t)
  track._t = setTimeout(sync, 60)
}, { passive: true })

track.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { e.preventDefault(); go(active + 1) }
  if (e.key === 'ArrowLeft') { e.preventDefault(); go(active - 1) }
})

/* drag to pan, like the reference */
let down = false, startX = 0, startScroll = 0, moved = false
track.addEventListener('pointerdown', (e) => {
  if (e.pointerType === 'touch') return          // let native touch scrolling win
  down = true; moved = false
  startX = e.clientX; startScroll = track.scrollLeft
  track.classList.add('dragging')
})
track.addEventListener('pointermove', (e) => {
  if (!down) return
  const dx = e.clientX - startX
  if (Math.abs(dx) > 4) moved = true
  track.scrollLeft = startScroll - dx
})
function endDrag () {
  if (!down) return
  down = false
  track.classList.remove('dragging')
  sync()
  go(active)
}
track.addEventListener('pointerup', endDrag)
track.addEventListener('pointercancel', endDrag)
track.addEventListener('pointerleave', endDrag)
// a drag should not follow the card's link
track.addEventListener('click', (e) => { if (moved) { e.preventDefault(); moved = false } }, true)

/* ── filtering ───────────────────────────────────────────────── */
function apply () {
  Array.from(track.children).forEach((s) => {
    const okGroup = group === 'all' || s.dataset.g === group
    const okQuery = !query || s.dataset.name.includes(query)
    s.hidden = !(okGroup && okQuery)
  })
  track.scrollTo({ left: 0, behavior: 'auto' })
  requestAnimationFrame(sync)
}

initSeg('#segCat', (v) => { group = v; apply() })
document.getElementById('q')?.addEventListener('input', (e) => {
  query = e.target.value.trim().toLowerCase()
  apply()
})

initCart()
initHero()
apply()
addEventListener('resize', sync)
addEventListener('load', sync)     // images settling can shift the centre
