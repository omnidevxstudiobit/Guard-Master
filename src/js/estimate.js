/* Quote estimator — six picks in, a real bill of materials out.
   Every rate is the factory's own (see variant-prices.js); the maths
   follows the manufacturer's assembly drawing: panels are 3 m bays,
   posts = panels + 1, spider clamps per panel scale with height. */

import { initCart, initHero } from './app.js'
import { initMotion } from './motion.js'
import { zar } from '../data/products.js'
import {
  PANELS, inclVat, POST_RATES, POST_LENGTH_MM, CLAMPS_PER_PANEL,
  FIXINGS, SPIKES, COILS, COIL_COVER_M,
} from '../data/variant-prices.js'

const $ = s => document.querySelector(s)

const sel = {
  use: 'Residential',
  grade: 'high',
  height: '1800',
  finish: 'plainGalv',
  extras: new Set(),
}

/* the use case nudges a sensible default security level */
const USE_GRADE = {
  'Residential': 'medium', 'Commercial': 'high', 'Industrial': 'high',
  'Utility / Solar': 'high', 'Government': 'high',
}

/* post rates keyed to the panel finish: the T-76×40 profile carries
   pre-galv / powder / plascoat rates; hot-dip uses the SQ HDG section */
const POST_RATE_FOR = {
  plainGalv: POST_RATES['T-Post 76mm × 40mm']['Pre-galvanized'],
  dipped: POST_RATES['SQ Post 76mm × 76mm']['HDG'],
  powderCoated: POST_RATES['T-Post 76mm × 40mm']['Powder-Coated'],
  plascoat: POST_RATES['T-Post 76mm × 40mm']['Plascoat'],
}
const SPIKE_FOR = {
  plainGalv: SPIKES['With fixators']['Pre Galv'],
  dipped: SPIKES['With fixators']['HDG'],
  powderCoated: SPIKES['With fixators']['Powder Coated'],
  plascoat: SPIKES['With fixators']['Plascoat / 10 years warranty'],
}
const GRADE_LABEL = { high: '76 × 12.7 mm', medium: '76 × 25 mm', low: '76 × 50 mm' }
const FIN_LABEL = { plainGalv: 'plain galvanized', dipped: 'hot-dip galvanized', powderCoated: 'powder coated', plascoat: 'Plascoat' }
const HT_LABEL = { 1800: "6′ (1.8 m)", 2100: "7′ (2.1 m)", 2400: "8′ (2.4 m)", 3000: "10′ (3.0 m)" }

const feet = () => Math.max(10, parseInt($('#len').value, 10) || 0)

function estimate () {
  const m = feet() * 0.3048
  const h = +sel.height
  const panels = Math.max(1, Math.ceil(m / 3))
  const posts = panels + 1
  const clampSets = panels * CLAMPS_PER_PANEL[h]

  const panelUnit = inclVat(PANELS['w3x4'][sel.grade][h][sel.finish])
  const postUnit = inclVat(POST_RATE_FOR[sel.finish] * (POST_LENGTH_MM[h] / 1000))
  const clampUnit = inclVat(FIXINGS['Flat Clamp Kit HDG'])

  const lines = [
    { n: panels, t: `Clear View panels — 10′ × ${HT_LABEL[h].split(' ')[0]}, ${GRADE_LABEL[sel.grade]}, ${FIN_LABEL[sel.finish]}`, unit: panelUnit },
    { n: posts, t: `posts — ${(POST_LENGTH_MM[h] / 1000).toFixed(1)} m, matched to panel height`, unit: postUnit },
    { n: clampSets, t: 'spider clamp sets', unit: clampUnit },
  ]
  if (sel.extras.has('caps')) lines.push({ n: posts, t: 'solar post caps', unit: 184 })
  if (sel.extras.has('spikes')) lines.push({ n: Math.ceil(m / 1.475), t: 'spike topping units (with fixators)', unit: inclVat(SPIKE_FOR[sel.finish]) })
  if (sel.extras.has('coil')) lines.push({ n: Math.ceil(m / COIL_COVER_M['Ø450mm']), t: 'concertina coils Ø450 mm', unit: inclVat(COILS['Ø450mm']) })

  const total = lines.reduce((s, l) => s + l.n * l.unit, 0)
  return { m, panels, lines, total }
}

function paint () {
  const { m, lines, total } = estimate()
  $('#lenM').textContent = `≈ ${m.toFixed(0)} m of fence line`
  $('#estFor').textContent = `${sel.use} · ${feet()} ft`
  $('#estTotal').textContent = zar(total)
  $('#bom').innerHTML = lines.map(l => `
    <div class="sum"><span class="k">${l.n} × ${l.t}</span><span class="v">${zar(l.n * l.unit)}</span></div>`).join('')

  const body = encodeURIComponent(
    `Guard Master estimate — ${sel.use}, ${feet()} linear ft\n\n` +
    lines.map(l => `${l.n} × ${l.t} — ${zar(l.n * l.unit)}`).join('\n') +
    `\n\nEstimated materials, tax-inclusive USD: ${zar(total)}\n` +
    'Converted from factory pricing at an indicative rate. Excludes freight, installation and groundworks — subject to site survey.'
  )
  $('#estMail').href = `mailto:?subject=${encodeURIComponent('My Guard Master fence estimate')}&body=${body}`
  $('#estQuote').href = `mailto:info@fencing-supplier.com?subject=${encodeURIComponent('Firm quote request — ' + sel.use + ', ' + feet() + ' ft')}&body=${body}`
}

/* chips: single-select per group, except the multi-select extras */
document.querySelectorAll('.chips[data-k]').forEach(host => {
  host.addEventListener('click', (e) => {
    const b = e.target.closest('.chip')
    if (!b) return
    const k = host.dataset.k
    if (k === 'extras') {
      const on = b.getAttribute('aria-pressed') === 'true'
      b.setAttribute('aria-pressed', String(!on))
      sel.extras[on ? 'delete' : 'add'](b.dataset.v)
    } else {
      sel[k] = b.dataset.v
      Array.from(host.children).forEach(c => c.setAttribute('aria-pressed', String(c === b)))
      if (k === 'use') {                       // nudge the grade, without forcing it
        const g = USE_GRADE[b.dataset.v]
        sel.grade = g
        document.querySelectorAll('.chips[data-k="grade"] .chip').forEach(c =>
          c.setAttribute('aria-pressed', String(c.dataset.v === g)))
      }
    }
    paint()
  })
})
$('#len').addEventListener('input', paint)

paint()
initCart()
initHero()
initMotion()
