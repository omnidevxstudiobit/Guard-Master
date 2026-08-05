/* Product detail page — one template for every product in the catalogue.
   Driven entirely by products.js: gallery, real options as pickers, the
   published from-price, and the product's own `pairs` as cross-sells. */

import { initCart, initHero } from './app.js'
import { initMotion } from './motion.js'
import { byId, zar, itemHref } from '../data/products.js'

const $ = s => document.querySelector(s)

const id = new URLSearchParams(location.search).get('p')
const p = byId(id)

if (!p) {
  location.replace('/products/')                      // unknown id → catalogue
} else if (p.href && !location.pathname.startsWith(p.href)) {
  location.replace(p.href)                            // has a dedicated page
} else {
  render(p)
}

function render (p) {
  document.title = `${p.t} — Guard Master`
  $('#crumb').textContent = p.t
  $('#pTitle').textContent = p.t
  $('#pDesc').textContent = `${p.d} ${p.plain}`
  $('#pPrice').textContent = `${p.flat ? '' : 'From '}${zar(p.from)}`
  $('#pSpec').textContent = p.spec

  /* ── gallery ─────────────────────────────────────────────────── */
  const main = $('#mainImg'), count = $('#galCount')
  let cur = 0
  const show = (i) => {
    cur = (i + p.gallery.length) % p.gallery.length
    main.src = p.gallery[cur]
    main.alt = `${p.t} — photo ${cur + 1}`
    count.textContent = `${cur + 1} / ${p.gallery.length}`
    document.querySelectorAll('#thumbs button').forEach((b, n) =>
      b.setAttribute('aria-current', String(n === cur)))
  }
  $('#thumbs').innerHTML = p.gallery.map((src, i) => `
    <button type="button" data-i="${i}"><img src="${src}" alt="" loading="${i ? 'lazy' : 'eager'}"></button>`).join('')
  $('#thumbs').addEventListener('click', (e) => {
    const b = e.target.closest('button')
    if (b) show(+b.dataset.i)
  })
  $('#stage').addEventListener('click', () => show(cur + 1))
  show(0)

  /* ── options — the factory's real variation attributes ───────── */
  $('#opts').innerHTML = (p.options || []).map((o, oi) => `
    <div class="field">
      <label for="opt${oi}">${o.k}</label>
      <select id="opt${oi}" data-k="${o.k}">
        ${o.v.map((v, vi) => `<option value="${v}">${v}${o.note?.[vi] ? ` — ${o.note[vi]}` : ''}</option>`).join('')}
      </select>
    </div>`).join('')

  /* ── quantity + add ──────────────────────────────────────────── */
  const qty = $('#qty')
  const q = () => Math.max(1, parseInt(qty.value, 10) || 1)
  $('#qMinus').addEventListener('click', () => { qty.value = Math.max(1, q() - 1) })
  $('#qPlus').addEventListener('click', () => { qty.value = q() + 1 })
  qty.addEventListener('change', () => { qty.value = q() })

  $('#add').addEventListener('click', () => {
    const picked = Array.from(document.querySelectorAll('#opts select'))
      .map(s => s.value).join(' · ')
    window.addToCart?.(q(), {
      id: p.id, t: p.t, unit: p.from,
      img: p.gallery[0], spec: picked || p.spec,
    })
    const btn = $('#add')
    btn.firstChild.textContent = 'Added '
    setTimeout(() => { btn.firstChild.textContent = 'Add to cart' }, 1400)
  })

  /* ── completes the system ────────────────────────────────────── */
  const pairs = (p.pairs || []).map(byId).filter(Boolean)
  if (!pairs.length) { $('#pairsSec').hidden = true } else {
    $('#pairs').innerHTML = pairs.map(r => `
      <a class="rec" href="${r.href || itemHref(r.id)}">
        <span class="im"><img src="${r.gallery[0]}" alt="${r.t}" loading="lazy"></span>
        <span class="bd">
          <span class="t">${r.t}</span>
          <span class="why">${r.plain}</span>
          <span class="ft"><span class="pr">${r.flat ? '' : 'From '}${zar(r.from)}</span></span>
        </span>
      </a>`).join('')
  }
}

initCart()
initHero()
initMotion()
