import { initCart, initReveal, initWipe, initMarquee, initHero, meshSVG } from './app.js'
import { byId, zar } from '../data/products.js'
import { panelUnit } from '../data/variant-prices.js'

/* Real catalogue options, exactly as the factory publishes them. */
const APS = [
  { v: '76mm × 12.7mm', t: 'High security',     h: 12.7 },
  { v: '76mm × 25mm',   t: 'Medium security',   h: 25 },
  { v: '76mm × 50mm',   t: 'Standard security', h: 50 },
]
/* labels stay the factory's exact option names — the imperial size is
   display-only, US-first per the brief */
const SZS = [
  { v: '3m × 1.8m', t: "10′ × 6′" },
  { v: '3m × 2.1m', t: "10′ × 7′" },
  { v: '3m × 2.4m', t: "10′ × 8′" },
  { v: '3m × 3m', t: "10′ × 10′" },
]
const WRS = ['3mm × 4mm', '4mm × 4mm']
const FNS = ['Plain Galvanised', 'Dipped', 'Powder Coated', 'Plascoat / 10yr']

/* Every combination now has the client's own estimator price — 96 real
   configurations recovered from their instant-quote data. */
const FROM = 550.85   // published "From:" price, the cheapest configuration
const unitFor = () => panelUnit({ wire: sel.wr, aperture: sel.ap, size: sel.sz, finish: sel.fn })

const sel = { ap: APS[0].v, sz: SZS[0], wr: WRS[0], fn: FNS[0] }
let qty = 1

const $ = s => document.querySelector(s)

function chips (hostId, items, key, labelId, after) {
  const host = $(hostId)
  host.innerHTML = ''
  items.forEach(it => {
    const val = it.v || it, sub = it.t || ''
    const b = document.createElement('button')
    b.className = 'chip'
    b.type = 'button'
    b.setAttribute('aria-pressed', String(val === sel[key]))
    b.innerHTML = val + (sub ? `<small>${sub}</small>` : '')
    b.addEventListener('click', () => {
      sel[key] = val
      Array.from(host.children).forEach(c => c.setAttribute('aria-pressed', String(c === b)))
      $(labelId).textContent = val
      after && after()
      price()
    })
    host.appendChild(b)
  })
}

/* ── the drawing plate ──────────────────────────────────────────
   A true-scale elevation of a two-bay run, drawn as line art on flat
   yellow. Everything is in millimetres and converted once, so the mesh
   density on screen is the real 358 geometry rather than a texture. */
function drawPlate () {
  const svg = $('#plateSvg')
  const r = $('#wipe').getBoundingClientRect()
  const w = Math.max(r.width, 640), h = Math.max(r.height, 320)
  const ap = APS.find(a => a.v === sel.ap) || APS[0]
  const panelH = parseFloat(sel.sz.split('×')[1]) * 1000 || 1800   // mm
  const BAYS = 2, BAY_W = 3000
  const ink = 'rgba(20,18,26,.55)'
  const inkHard = 'rgba(20,18,26,.85)'

  // fit the run into the plate, keeping x and y on one scale
  const runMM = BAYS * BAY_W
  // leave headroom for the lead copy and the spike topping above the panel
  const scale = Math.min((w * 0.84) / runMM, (h * 0.44) / panelH)
  const runW = runMM * scale, runH = panelH * scale
  const x0 = (w - runW) / 2
  const groundY = h * 0.9
  const topY = groundY - runH

  let posts = ''
  for (let i = 0; i <= BAYS; i++) {
    const x = x0 + i * BAY_W * scale
    posts += `<line x1="${x.toFixed(1)}" y1="${(topY - 6).toFixed(1)}" x2="${x.toFixed(1)}" y2="${groundY}" stroke="${inkHard}" stroke-width="3"/>`
    posts += `<rect x="${(x - 7).toFixed(1)}" y="${(topY - 16).toFixed(1)}" width="14" height="11" rx="3" fill="none" stroke="${inkHard}" stroke-width="2"/>`
    for (let s = -2; s <= 2; s++) {
      const sx = x + s * 9
      posts += `<path d="M${sx.toFixed(1)} ${(topY - 16).toFixed(1)} l4.5 -17 l4.5 17" fill="none" stroke="${ink}" stroke-width="1.4" stroke-linejoin="round"/>`
    }
  }

  const dimY = groundY + 22
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`)
  svg.innerHTML = `
    <g transform="translate(${x0.toFixed(1)} ${topY.toFixed(1)})">
      ${meshSVG(runW, runH, ap.h, { stroke: ink, sw: 0.7, scale })}
    </g>
    <rect x="${x0.toFixed(1)}" y="${topY.toFixed(1)}" width="${runW.toFixed(1)}" height="${runH.toFixed(1)}"
          fill="none" stroke="${inkHard}" stroke-width="1.6"/>
    ${posts}
    <line x1="${(x0 - 40).toFixed(1)}" y1="${groundY}" x2="${(x0 + runW + 40).toFixed(1)}" y2="${groundY}" stroke="${inkHard}" stroke-width="2.4"/>

    <g stroke="rgba(20,18,26,.5)" stroke-width="1" font-family="ui-monospace,monospace" font-size="10.5" fill="rgba(20,18,26,.72)">
      <line x1="${(x0 - 20).toFixed(1)}" y1="${topY.toFixed(1)}" x2="${(x0 - 20).toFixed(1)}" y2="${groundY}" stroke-dasharray="3 4"/>
      <text x="${(x0 - 26).toFixed(1)}" y="${(topY + runH / 2).toFixed(1)}" text-anchor="end">${panelH} mm</text>
      <line x1="${x0.toFixed(1)}" y1="${dimY}" x2="${(x0 + BAY_W * scale).toFixed(1)}" y2="${dimY}" stroke-dasharray="3 4"/>
      <text x="${(x0 + BAY_W * scale / 2).toFixed(1)}" y="${dimY + 14}" text-anchor="middle">3000 mm</text>
    </g>`
  $('#plateSpec').textContent = `${ap.v} · ${ap.t.toLowerCase()}`
}

function drawTiers () {
  const host = $('#aps')
  host.innerHTML = APS.map(a => `
    <div class="ap">
      <div class="g"><svg viewBox="0 0 320 220">
        <rect width="320" height="220" fill="#fff"/>
        ${meshSVG(320, 220, a.h, { stroke: 'rgba(20,18,26,.72)', sw: 1.15, scale: 0.7 })}
      </svg></div>
      <div class="b"><div class="t">${a.v}</div><div class="s">${a.t}</div></div>
    </div>`).join('')
}

function price () {
  ;['ap', 'sz', 'wr', 'fn'].forEach(k => {
    $('#r' + k[0].toUpperCase() + k.slice(1)).textContent = sel[k]
  })
  const exact = unitFor()
  const unit = exact ?? FROM
  const el = $('#price')
  el.classList.remove('poa')
  el.textContent = zar(unit * qty)
  $('#vatLine').textContent = exact
    ? `Incl. VAT · ${qty} panel${qty > 1 ? 's' : ''}`
    : `From price · ${qty} panel${qty > 1 ? 's' : ''} · confirmed on order`
}

/* ── boot ─────────────────────────────────────────────────── */
chips('#cAp', APS, 'ap', '#vAp', drawPlate)
chips('#cSz', SZS, 'sz', '#vSz')
chips('#cWr', WRS, 'wr', '#vWr')
chips('#cFn', FNS, 'fn', '#vFn')
drawTiers()
drawPlate()
price()

$('#qPlus').addEventListener('click', () => { qty++; $('#qVal').textContent = qty; price() })
$('#qMinus').addEventListener('click', () => { if (qty > 1) { qty--; $('#qVal').textContent = qty; price() } })
$('#addBtn').addEventListener('click', () => {
  // every combination carries the estimator's real figure; FROM only backstops
  const unit = unitFor() ?? FROM
  window.addToCart?.(qty, {
    id: 'panels',                       // links the line to the catalogue entry
    t: `Clear View panel — ${sel.sz}`,
    unit,
    img: '/images/products/clear-view-fencing-panels/30-480.webp',
    spec: `${sel.ap} · ${sel.fn}`,
  })
})

/* ── gallery: rail + stage + hover zoom + lightbox ─────────────── */
const GAL = byId('panels').gallery
const CAPS = [
  'Panel, post and spike topping assembled',
  'Panel and post with shark-tooth topping',
  '76 × 12.7mm aperture, close',
  'Resistance-welded wire junction',
  'Installed boundary at dusk — sightline unbroken',
]
let gi = 0

const galImg = $('#galImg'), galMain = $('#galMain')

function showImage (i, animate = true) {
  gi = (i + GAL.length) % GAL.length
  if (animate) galImg.style.opacity = '0'
  const swap = () => {
    galImg.src = GAL[gi]
    galImg.alt = CAPS[gi] || 'Clear View fencing panel'
    galImg.style.opacity = '1'
  }
  animate ? setTimeout(swap, 130) : swap()
  $('#galCount').textContent = `${gi + 1} / ${GAL.length}`
  Array.from($('#galThumbs').children).forEach((b, n) =>
    b.setAttribute('aria-current', String(n === gi)))
  if ($('#lb').hasAttribute('open')) openLightbox(gi)
}

$('#galThumbs').innerHTML = GAL.map((src, i) =>
  `<button type="button" aria-label="View image ${i + 1}" aria-current="${i === 0}">
     <img src="${src}" alt="" loading="${i < 3 ? 'eager' : 'lazy'}">
   </button>`).join('')
$('#galThumbs').addEventListener('click', (e) => {
  const b = e.target.closest('button')
  if (b) showImage(Array.from($('#galThumbs').children).indexOf(b))
})
$('#galPrev').addEventListener('click', (e) => { e.stopPropagation(); showImage(gi - 1) })
$('#galNext').addEventListener('click', (e) => { e.stopPropagation(); showImage(gi + 1) })

/* hover-to-zoom: origin follows the cursor, so it reads as a loupe */
if (matchMedia('(hover:hover)').matches) {
  galMain.addEventListener('pointerenter', () => galMain.classList.add('zooming'))
  galMain.addEventListener('pointermove', (e) => {
    const r = galMain.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    galImg.style.transformOrigin = `${x}% ${y}%`
    galImg.style.transform = 'scale(2.1)'
  })
  galMain.addEventListener('pointerleave', () => {
    galMain.classList.remove('zooming')
    galImg.style.transform = ''
  })
}

/* lightbox */
function openLightbox (i) {
  $('#lbImg').src = GAL[i]
  $('#lbCap').textContent = `${i + 1} / ${GAL.length} — ${CAPS[i] || ''}`
  $('#lb').setAttribute('open', '')
  document.body.style.overflow = 'hidden'
}
function closeLightbox () {
  $('#lb').removeAttribute('open')
  document.body.style.overflow = ''
}
galMain.addEventListener('click', () => openLightbox(gi))
$('#lbX').addEventListener('click', closeLightbox)
$('#lbPrev').addEventListener('click', (e) => { e.stopPropagation(); showImage(gi - 1) })
$('#lbNext').addEventListener('click', (e) => { e.stopPropagation(); showImage(gi + 1) })
$('#lb').addEventListener('click', (e) => { if (e.target.id === 'lb') closeLightbox() })
addEventListener('keydown', (e) => {
  if (!$('#lb').hasAttribute('open')) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowRight') showImage(gi + 1)
  if (e.key === 'ArrowLeft') showImage(gi - 1)
})
showImage(0, false)

/* ── help me choose ───────────────────────────────────────────── */
const pick = { use: null, sz: null }
const ADVICE = {
  home: { ap: '76mm × 25mm', fn: 'Powder Coated',
    why: 'A 76 × 25mm aperture still refuses a toehold but costs less than the high-security mesh, and powder coating looks right on a boundary you see every day.' },
  biz:  { ap: '76mm × 12.7mm', fn: 'Plain Galvanised',
    why: 'Yards get tested. The 12.7mm aperture takes a bolt-cutter jaw out of the equation, and plain galvanised is the cheapest finish that survives outdoors.' },
  high: { ap: '76mm × 12.7mm', fn: 'Plascoat / 10yr',
    why: 'Tightest mesh we make, on the finish that carries the 10-year warranty. This is the specification for anything that must not be entered.' },
}

function bindPicks (hostId, key) {
  $(hostId).addEventListener('click', (e) => {
    const b = e.target.closest('.opt-b')
    if (!b) return
    Array.from($(hostId).children).forEach(x => x.setAttribute('aria-pressed', String(x === b)))
    pick[key] = b.dataset.v
    renderVerdict()
  })
}
function renderVerdict () {
  if (!pick.use || !pick.sz) return
  const a = ADVICE[pick.use]
  $('#vTitle').textContent = `${pick.sz.split('×')[1].trim()} · ${a.ap} · ${a.fn}`
  $('#vWhy').textContent = a.why
  $('#verdict').hidden = false
}
bindPicks('#qUse', 'use')
bindPicks('#qHeight', 'sz')

$('#vApply').addEventListener('click', () => {
  const a = ADVICE[pick.use]
  applySpec({ ap: a.ap, sz: pick.sz, fn: a.fn })
  $('#configure').scrollIntoView({ behavior: 'smooth', block: 'start' })
})

/* set the chips from outside the chip handlers */
function applySpec ({ ap, sz, fn }) {
  const map = { ap: ['#cAp', '#vAp'], sz: ['#cSz', '#vSz'], fn: ['#cFn', '#vFn'] }
  Object.entries({ ap, sz, fn }).forEach(([k, val]) => {
    if (!val) return
    sel[k] = val
    const [host, label] = map[k]
    Array.from($(host).children).forEach(c =>
      c.setAttribute('aria-pressed', String(c.textContent.startsWith(val))))
    $(label).textContent = val
  })
  drawPlate()
  price()
}

initCart()
initHero()
initReveal()
initWipe('#wipe')
initMarquee('#marq', [
  'Welded at every crossing', 'Four finish systems', 'Heights 1.8 – 3.0m',
  'Always in stock', 'Factory direct from Benoni',
])
addEventListener('resize', drawPlate)
