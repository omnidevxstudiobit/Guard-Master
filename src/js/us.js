/* Company page — two interactive dot-grid maps built by one helper:
   South Africa (the factory's proving ground) and the continental US
   (the welcome — Guard Master US and its shipping destinations).
   Both silhouettes are stylised originals; an info card follows the
   active marker on hover, tap or keyboard focus. */

import { initCart, initHero } from './app.js'
import { initMotion } from './motion.js'
import { OV } from '../data/overrides.js'
import { SA_CITIES, US_CITIES } from '../data/map-cities.js'

const $ = s => document.querySelector(s)

/* /admin/ Locations can replace either city list; a valid entry needs a
   name, copy and normalised coords — anything else keeps the defaults */
const adminCities = (key, fallback) => {
  const list = OV.locations?.[key]?.cities
  if (!Array.isArray(list) || !list.length) return fallback
  const ok = list.every(c => c && typeof c.n === 'string' && typeof c.d === 'string' &&
    typeof c.x === 'number' && c.x >= 0 && c.x <= 1 &&
    typeof c.y === 'number' && c.y >= 0 && c.y <= 1)
  return ok ? list : fallback
}

/* point-in-polygon (ray cast), with an optional elliptical hole */
const inside = (outline, hole) => (x, y) => {
  let ok = false
  for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
    const [xi, yi] = outline[i], [xj, yj] = outline[j]
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ok = !ok
  }
  if (!ok || !hole) return ok
  const dx = (x - hole.x) / hole.rx, dy = (y - hole.y) / hole.ry
  return dx * dx + dy * dy >= 1
}

function buildMap ({ hostId, infoId, W, H, step, outline, hole, cities }) {
  const host = $(hostId)
  if (!host) return
  const hit = inside(outline, hole)
  const PAD = 14
  const px = v => PAD + v * (W - PAD * 2)
  const py = v => PAD + v * (H - PAD * 2)

  let dots = ''
  for (let y = 0; y <= 1; y += step) {
    for (let x = 0; x <= 1; x += step) {
      if (hit(x, y)) dots += `<circle cx="${px(x).toFixed(1)}" cy="${py(y).toFixed(1)}" r="2.1"/>`
    }
  }
  host.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
      <g fill="rgba(20,18,26,.16)">${dots}</g>
    </svg>
    ${cities.map((c, i) => `
      <button class="city${c.home ? ' city--home' : ''}" type="button" data-i="${i}"
              style="left:${(px(c.x) / W * 100).toFixed(2)}%;top:${(py(c.y) / H * 100).toFixed(2)}%"
              aria-label="${c.n}"><i></i></button>`).join('')}`

  const info = $(infoId)
  const show = (i) => {
    const c = cities[i]
    info.innerHTML = `<b>${c.n}</b><p>${c.d}</p>`
    host.querySelectorAll('.city').forEach((b, n) =>
      b.setAttribute('aria-pressed', String(n === i)))
  }
  const pick = (e) => {
    const b = e.target.closest('.city')
    if (b) show(+b.dataset.i)
  }
  host.addEventListener('click', pick)
  host.addEventListener('pointerover', pick)
  host.addEventListener('focusin', pick)
  show(0)
}

/* ── South Africa — the factory's proving ground ─────────────── */
buildMap({
  hostId: '#saMap', infoId: '#cityInfo', W: 760, H: 600, step: 0.021,
  outline: [
    [0, .52], [.21, .22], [.30, .27], [.42, .255], [.52, .20], [.62, .13],
    [.72, .05], [.80, .02], [.90, .03], [.90, .20], [.98, .33], [1, .40],
    [.93, .52], [.885, .61], [.80, .73], [.70, .86], [.60, .92], [.50, .945],
    [.38, .955], [.21, 1], [.14, .965], [.117, .93], [.06, .80], [.03, .66],
  ],
  hole: { x: .725, y: .60, rx: .052, ry: .075 },
  cities: adminCities('sa', SA_CITIES),
})

/* ── the continental US — the welcome ────────────────────────── */
buildMap({
  hostId: '#usMap', infoId: '#usInfo', W: 760, H: 360, step: 0.02,
  outline: [
    [.005, .03], [.014, .38], [.076, .6], [.136, .69], [.176, .69], [.241, .74],
    [.29, .72], [.319, .72], [.347, .77], [.378, .83], [.407, .8], [.445, .94],
    [.481, .96], [.476, .88], [.538, .8], [.619, .83], [.691, .8], [.729, .88],
    [.759, .99], [.774, .93], [.752, .78], [.76, .71], [.853, .58], [.847, .5],
    [.879, .35], [.948, .32], [.95, .3], [1, .18], [.962, .07], [.922, .17],
    [.831, .23], [.793, .24], [.729, .3], [.693, .13], [.631, .03], [.514, 0], [.034, 0],
  ],
  cities: adminCities('us', US_CITIES),
})

initCart()
initHero()
initMotion()
