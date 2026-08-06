/* Product detail page — one template for every product in the catalogue.
   Driven entirely by products.js: gallery, real options as pickers, the
   published from-price, and the product's own `pairs` as cross-sells. */

import { initCart, initHero } from './app.js'
import { initMotion } from './motion.js'
import { byId, zar, itemHref, ZAR_PER_USD } from '../data/products.js'
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
          '@type': 'Offer', priceCurrency: 'USD', price: (p.from / ZAR_PER_USD).toFixed(2),
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
  $('#gPrev').addEventListener('click', (e) => { e.stopPropagation(); show(cur - 1) })
  $('#gNext').addEventListener('click', (e) => { e.stopPropagation(); show(cur + 1) })
  $('#stage').addEventListener('click', (e) => { if (!e.target.closest('.nav-a')) show(cur + 1) })
  show(0)

  /* hover-to-zoom loupe — the origin follows the cursor */
  const stage = $('#stage')
  if (matchMedia('(hover:hover)').matches) {
    stage.addEventListener('pointerenter', () => stage.classList.add('zooming'))
    stage.addEventListener('pointermove', (e) => {
      const r = stage.getBoundingClientRect()
      main.style.transformOrigin = `${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`
      main.style.transform = 'scale(2.1)'
    })
    stage.addEventListener('pointerleave', () => {
      stage.classList.remove('zooming')
      main.style.transform = ''
    })
  }

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

  /* auto-suggest, don't force — the brief's post-height helper */
  if (p.id === 'posts') {
    $('#opts').insertAdjacentHTML('beforeend',
      `<p class="opt-hint">For a 6′ panel use an 8′ post — the extra 2′ sets below grade.
        Matched lengths: 6′ panel → 8′ post · 7′ → 9′ · 8′ → 10′ · 10′ → 12′.</p>`)
  }

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
    /* the configured SKU: product code + one digit per picked option */
    const code = (p.options || []).map(o => o.v.indexOf(picks[o.k]) + 1).join('')
    $('#pSku').textContent = `SKU GM-${p.id.slice(0, 3).toUpperCase()}${code ? '-' + code : ''}`
    const mTot = document.getElementById('mTotal')
    if (mTot) { mTot.textContent = zar(unit * q()); document.getElementById('mBar').hidden = false }
    const mini = document.getElementById('miniTot')
    if (mini) mini.textContent = zar(unit * q())
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

document.getElementById('mAdd')?.addEventListener('click', () => $('#add')?.click())
document.getElementById('printSpec')?.addEventListener('click', () => window.print())

/* self-referencing canonical, including the ?p= product */
const canon = document.createElement('link')
canon.rel = 'canonical'
canon.href = 'https://guardmasterfencing.com/products/item/' + (p ? `?p=${p.id}` : '')
document.head.appendChild(canon)

initCart()
initHero()
initMotion()
