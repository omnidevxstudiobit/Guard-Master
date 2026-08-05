/* USA page — the SA journey on an interactive dot map, plus the
   crossing to the Florida export desk. The map is a stylised dot-grid
   silhouette of South Africa (Lesotho cut out), with real delivery
   cities as markers and the factory pulsing in Benoni. */

import { initCart, initHero } from './app.js'
import { initMotion } from './motion.js'

const $ = s => document.querySelector(s)

/* stylised silhouette, normalised 0..1 — x runs east, y runs south */
const OUTLINE = [
  [0, .52], [.21, .22], [.30, .27], [.42, .255], [.52, .20], [.62, .13],
  [.72, .05], [.80, .02], [.90, .03], [.90, .20], [.98, .33], [1, .40],
  [.93, .52], [.885, .61], [.80, .73], [.70, .86], [.60, .92], [.50, .945],
  [.38, .955], [.21, 1], [.14, .965], [.117, .93], [.06, .80], [.03, .66],
]
const LESOTHO = { x: .725, y: .60, rx: .052, ry: .075 }

function inside (x, y) {
  let ok = false
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [xi, yi] = OUTLINE[i], [xj, yj] = OUTLINE[j]
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ok = !ok
  }
  if (!ok) return false
  const dx = (x - LESOTHO.x) / LESOTHO.rx, dy = (y - LESOTHO.y) / LESOTHO.ry
  return dx * dx + dy * dy >= 1
}

const CITIES = [
  { x: .72, y: .335, n: 'Benoni — the factory', d: 'Every panel starts here: welded at every crossing and coated in Benoni South, Gauteng.', home: true },
  { x: .685, y: .35, n: 'Johannesburg', d: 'Home turf — Steyn City, PRASA and the rest of the roster.' },
  { x: .705, y: .285, n: 'Pretoria', d: 'Gauteng deliveries run constantly.' },
  { x: .885, y: .615, n: 'Durban', d: 'Coastal air calls for the hot-dip galvanised finish.' },
  { x: .12, y: .92, n: 'Cape Town', d: 'Nationwide delivery — coast to coast.' },
  { x: .55, y: .92, n: 'Gqeberha', d: 'Eastern Cape, delivered.' },
  { x: .59, y: .55, n: 'Bloemfontein', d: 'Free State, delivered.' },
  { x: .79, y: .15, n: 'Polokwane', d: 'Limpopo, delivered.' },
  { x: .875, y: .275, n: 'Mbombela', d: 'Mpumalanga, delivered.' },
  { x: .50, y: .53, n: 'Kimberley', d: 'Northern Cape, delivered.' },
]

/* ── build the map ────────────────────────────────────────────── */
const map = $('#saMap')
const W = 760, H = 600, PAD = 14
const px = v => PAD + v * (W - PAD * 2)
const py = v => PAD + v * (H - PAD * 2)

let dots = ''
const STEP = .021
for (let y = 0; y <= 1; y += STEP) {
  for (let x = 0; x <= 1; x += STEP) {
    if (inside(x, y)) dots += `<circle cx="${px(x).toFixed(1)}" cy="${py(y).toFixed(1)}" r="2.1"/>`
  }
}
map.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
    <g fill="rgba(20,18,26,.16)">${dots}</g>
  </svg>
  ${CITIES.map((c, i) => `
    <button class="city${c.home ? ' city--home' : ''}" type="button" data-i="${i}"
            style="left:${(px(c.x) / W * 100).toFixed(2)}%;top:${(py(c.y) / H * 100).toFixed(2)}%"
            aria-label="${c.n}"><i></i></button>`).join('')}`

/* ── the info card follows the active city ────────────────────── */
const info = $('#cityInfo')
function show (i) {
  const c = CITIES[i]
  info.innerHTML = `<b>${c.n}</b><p>${c.d}</p>`
  document.querySelectorAll('.city').forEach((b, n) =>
    b.setAttribute('aria-pressed', String(n === i)))
}
map.addEventListener('click', (e) => {
  const b = e.target.closest('.city')
  if (b) show(+b.dataset.i)
})
map.addEventListener('pointerover', (e) => {
  const b = e.target.closest('.city')
  if (b) show(+b.dataset.i)
})
map.addEventListener('focusin', (e) => {
  const b = e.target.closest('.city')
  if (b) show(+b.dataset.i)
})
show(0)

initCart()
initHero()
initMotion()
