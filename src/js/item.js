/* Product detail page — one template for every product in the catalogue.
   Driven entirely by products.js: gallery, real options as pickers, the
   published from-price, and the product's own `pairs` as cross-sells. */

import { initCart, initHero } from './app.js'
import { initMotion } from './motion.js'
import { byId, zar, itemHref } from '../data/products.js'
import { resolveUnit } from '../data/variant-prices.js'

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

  /* Product + Offer and breadcrumb structured data, per the SEO spec */
  const ld = document.createElement('script')
  ld.type = 'application/ld+json'
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        name: p.t,
        description: p.d,
        image: location.origin + p.gallery[0],
        brand: { '@type': 'Brand', name: 'Guard Master' },
        offers: {
          '@type': 'Offer', priceCurrency: 'ZAR', price: p.from.toFixed(2),
          availability: 'https://schema.org/InStock', url: location.href,
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Catalogue', item: location.origin + '/products/' },
          { '@type': 'ListItem', position: 2, name: p.t, item: location.href },
        ],
      },
    ],
  })
  document.head.appendChild(ld)
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

  /* ── build it — the factory's real options as chips ──────────── */
  const picks = {}
  ;(p.options || []).forEach(o => { picks[o.k] = o.v[0] })

  $('#opts').innerHTML = (p.options || []).map(o => `
    <div class="opt-group">
      <p class="eyebrow" style="margin:0 0 8px">${o.k}</p>
      <div class="chips" data-k="${o.k}">
        ${o.v.map((v, vi) => `
          <button class="chip" type="button" data-v="${v}" aria-pressed="${vi === 0}">
            ${v}${o.note?.[vi] ? `<small>${o.note[vi]}</small>` : ''}
          </button>`).join('')}
      </div>
    </div>`).join('')

  $('#opts').addEventListener('click', (e) => {
    const b = e.target.closest('.chip')
    if (!b) return
    const host = b.closest('.chips')
    picks[host.dataset.k] = b.dataset.v
    Array.from(host.children).forEach(c => c.setAttribute('aria-pressed', String(c === b)))
    total()
  })

  /* ── the sum — recalculated on every pick, real figures only ─── */
  const qty = $('#qty')
  const q = () => Math.max(1, parseInt(qty.value, 10) || 1)
  const priceNow = () => resolveUnit(p, picks)

  function total () {
    $('#sumRows').innerHTML = (p.options || []).map(o => `
      <div class="sum"><span class="k">${o.k}</span><span class="v">${picks[o.k]}</span></div>`).join('')
    const { unit, exact } = priceNow()
    $('#pTotal').textContent = zar(unit * q())
    $('#pNote').textContent = exact
      ? `Incl. VAT · ${q()} ${q() > 1 ? 'units' : 'unit'}`
      : `From price · ${q()} ${q() > 1 ? 'units' : 'unit'} · exact figure confirmed on order`
  }

  $('#qMinus').addEventListener('click', () => { qty.value = Math.max(1, q() - 1); total() })
  $('#qPlus').addEventListener('click', () => { qty.value = q() + 1; total() })
  qty.addEventListener('change', () => { qty.value = q(); total() })
  total()

  $('#add').addEventListener('click', () => {
    const { unit } = priceNow()
    const picked = (p.options || []).map(o => picks[o.k]).join(' · ')
    window.addToCart?.(q(), {
      id: p.id, t: p.t, unit,
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
