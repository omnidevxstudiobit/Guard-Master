import { initCart, initHero } from './app.js'
import { initMotion } from './motion.js'
import { byId, zar, itemHref } from '../data/products.js'
import { catById } from '../data/categories.js'

const $ = s => document.querySelector(s)
const cat = catById(document.body.dataset.cat)
if (!cat) throw new Error('unknown category: ' + document.body.dataset.cat)

/* the accent drives the header wash and anything else marked --a */
document.documentElement.style.setProperty('--a', cat.accent)

const blurb = $('#catBlurb')
if (blurb) blurb.textContent = cat.blurb

/* ── the buy grid ─────────────────────────────────────────────── */
$('#buyGrid').innerHTML = cat.products.map(id => {
  const p = byId(id)
  if (!p) return ''
  return `<div class="buy-card">
    <a class="im" href="${itemHref(p.id)}"><img src="${p.gallery[0]}" alt="${p.t}" loading="lazy">${p.gallery[1] ? `<img class="alt" src="${p.gallery[1]}" alt="" loading="lazy">` : ''}</a>
    <div class="bd">
      <a class="t" href="${itemHref(p.id)}" style="text-decoration:none;color:inherit">${p.t}</a>
      <span class="plain">${p.plain}</span>
      <span class="ft">
        <span class="pr">${p.flat ? '' : 'From '}${zar(p.from)}</span>
        <button class="go" type="button" data-add="${p.id}">Add</button>
      </span>
    </div>
  </div>`
}).join('')

$('#buyGrid').addEventListener('click', (e) => {
  const b = e.target.closest('[data-add]')
  if (!b) return
  const p = byId(b.dataset.add)
  if (!p) return
  window.addToCart?.(1, { id: p.id, t: p.t, unit: p.from, img: p.gallery[0], spec: p.spec })
  b.textContent = 'Added'
  setTimeout(() => { b.textContent = 'Add' }, 1400)
})

/* ── finishes as swatches — the coating is a colour, not a photo ── */
const row = $('#finRow'), note = $('#finNote')
if (row && note && cat.finishes) {
  row.innerHTML = cat.finishes.map((f, i) => `
    <button class="sw" type="button" style="background:${f.sw}"
            aria-pressed="${i === 0}" data-i="${i}" aria-label="${f.t}"></button>`).join('')
  const show = (i) => {
    const f = cat.finishes[i]
    note.innerHTML = `<b>${f.t}</b><p>${f.d}</p>`
  }
  row.addEventListener('click', (e) => {
    const b = e.target.closest('.sw')
    if (!b) return
    row.querySelectorAll('.sw').forEach(s => s.setAttribute('aria-pressed', String(s === b)))
    show(+b.dataset.i)
  })
  show(0)
}

initCart()
initHero()
initMotion()   // Lenis + GSAP: split headings, rise groups, staircase
