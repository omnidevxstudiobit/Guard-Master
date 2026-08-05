import { initCart, initHero, cartStore } from './app.js'
import { PRODUCTS, byId, zar } from '../data/products.js'

const $ = s => document.querySelector(s)
const $$ = s => Array.from(document.querySelectorAll(s))

/* SA VAT is 15% and every published price already includes it, so the VAT
   line is the component inside the total, not something added on top. */
const VAT_RATE = 0.15
const vatPart = (incl) => incl * VAT_RATE / (1 + VAT_RATE)

/* ── summary ──────────────────────────────────────────────────── */
function lines () { return cartStore.read() }

function renderSummary () {
  const order = lines()
  const box = $('#sumLines')
  const tot = $('#sumTotals')

  if (!order.length) {
    box.innerHTML = `<p class="empty">Your cart is empty.
      <a href="/products/" style="color:var(--ink)">Browse the catalogue</a>.</p>`
    tot.innerHTML = ''
    $('#sumCount').textContent = '0 items'
    $('#place').disabled = true
    $('#place').style.opacity = '.45'
    $('#placeLabel').textContent = 'Nothing to order'
    return
  }

  box.innerHTML = order.map((l, i) => `
    <div class="line">
      <div class="th">${l.img ? `<img src="${l.img}" alt="">` : ''}</div>
      <div class="info"><b>${l.t}</b><span>${zar(l.unit)} each · ×${l.qty}</span></div>
      <span class="amt">${zar(l.unit * l.qty)}</span>
    </div>`).join('')

  const goods = order.reduce((s, l) => s + l.unit * l.qty, 0)
  const units = order.reduce((s, l) => s + l.qty, 0)
  const deliver = $('input[name="fulfil"]:checked')?.value === 'deliver'

  tot.innerHTML = `
    <div class="sum"><span class="k">Goods</span><span class="v">${zar(goods)}</span></div>
    <div class="sum"><span class="k">of which VAT (15%)</span><span class="v">${zar(vatPart(goods))}</span></div>
    <div class="sum"><span class="k">${deliver ? 'Delivery' : 'Collection'}</span>
      <span class="v">${deliver ? 'Quoted on dispatch' : 'Free'}</span></div>
    <div class="sum total"><span class="k">Total</span><span class="v">${zar(goods)}</span></div>
    ${deliver ? '<p class="vat" style="font-family:var(--mono);font-size:10.5px;color:var(--muted);margin:6px 0 0">Freight is confirmed against your address before anything is dispatched.</p>' : ''}`

  $('#sumCount').textContent = `${units} item${units > 1 ? 's' : ''}`
  $('#place').disabled = false
  $('#place').style.opacity = ''
  $('#placeLabel').textContent = `Place order · ${zar(goods)}`
}

/* ── collect vs deliver ───────────────────────────────────────── */
$$('input[name="fulfil"]').forEach(r => r.addEventListener('change', () => {
  const deliver = $('input[name="fulfil"]:checked').value === 'deliver'
  $('#addrStep').hidden = !deliver
  $('#nSite').textContent = deliver ? '4' : '3'
  renderSummary()
}))

/* ── validation ───────────────────────────────────────────────── */
const RULES = {
  name:  v => v.trim().length >= 2 || 'Please give us a name',
  email: v => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.trim()) || 'That email does not look right',
  phone: v => v.replace(/\D/g, '').length >= 9 || 'A contactable number, please',
  street:   v => v.trim().length >= 4 || 'Street address is needed to deliver',
  city:     v => v.trim().length >= 2 || 'Which town or city?',
  province: v => !!v || 'Choose a province',
  postal:   v => /^\d{4}$/.test(v.trim()) || 'South African postal codes are 4 digits',
}

function fieldsToCheck () {
  const base = ['name', 'email', 'phone']
  const deliver = $('input[name="fulfil"]:checked').value === 'deliver'
  return deliver ? base.concat(['street', 'city', 'province', 'postal']) : base
}

function validate (showAll = true) {
  let ok = true, first = null
  fieldsToCheck().forEach(id => {
    const el = $('#' + id)
    const res = RULES[id](el.value)
    const msg = res === true ? '' : res
    const errEl = document.querySelector(`[data-err="${id}"]`)
    if (msg && showAll) {
      el.setAttribute('aria-invalid', 'true')
      if (errEl) errEl.textContent = msg
      if (!first) first = el
      ok = false
    } else if (msg) {
      ok = false
    } else {
      el.removeAttribute('aria-invalid')
      if (errEl) errEl.textContent = ''
    }
  })
  return { ok, first }
}

// clear a field's error as soon as it becomes valid
$$('#form input, #form select').forEach(el => {
  el.addEventListener('input', () => {
    if (!RULES[el.id]) return
    if (RULES[el.id](el.value) === true) {
      el.removeAttribute('aria-invalid')
      const e = document.querySelector(`[data-err="${el.id}"]`)
      if (e) e.textContent = ''
    }
  })
})

/* ── place the order ──────────────────────────────────────────── */
function reference () {
  const d = new Date()
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `GM-${stamp}-${rand}`
}

function recommendations (order) {
  const have = new Set(order.map(l => l.id))
  const want = []
  order.forEach(l => (byId(l.id)?.pairs || []).forEach(id => {
    if (!have.has(id) && !want.includes(id)) want.push(id)
  }))
  return want.slice(0, 3).map(byId).filter(Boolean)
}

$('#form').addEventListener('submit', (e) => {
  e.preventDefault()
  const order = lines()
  if (!order.length) return

  const { ok, first } = validate(true)
  if (!ok) { first?.focus(); first?.scrollIntoView({ behavior: 'smooth', block: 'center' }); return }

  const ref = reference()
  const goods = order.reduce((s, l) => s + l.unit * l.qty, 0)
  const deliver = $('input[name="fulfil"]:checked').value === 'deliver'
  const recs = recommendations(order)

  // a real build would POST this; here it is kept so the confirmation is truthful
  const placed = {
    ref, placedAt: new Date().toISOString(), goods, deliver,
    customer: {
      name: $('#name').value.trim(), email: $('#email').value.trim(),
      phone: $('#phone').value.trim(), company: $('#company').value.trim(),
      site: $('#site').value, notes: $('#notes').value.trim(),
      address: deliver ? {
        street: $('#street').value.trim(), suburb: $('#suburb').value.trim(),
        city: $('#city').value.trim(), province: $('#province').value, postal: $('#postal').value.trim(),
      } : null,
    },
    lines: order,
  }
  sessionStorage.setItem('gm_last_order', JSON.stringify(placed))

  cartStore.clear()
  window.refreshCart?.()

  $('#co').innerHTML = `
    <div class="card glass glass--lit placed" style="grid-column:1/-1">
      <div class="tick">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
      </div>
      <h2 class="h1" style="font-size:clamp(28px,4vw,44px);font-weight:800;letter-spacing:-.04em">Order placed.</h2>
      <span class="ref">${ref}</span>
      <p>Thanks ${placed.customer.name.split(' ')[0]} — we've got it. The factory will confirm stock and
        ${deliver ? 'freight to ' + (placed.customer.address.city || 'your address') : 'a collection slot'}
        by email to <b style="color:var(--ink)">${placed.customer.email}</b>, usually within one working day.</p>
      <p style="margin-top:14px"><b style="color:var(--ink)">${zar(goods)}</b> incl. VAT · ${order.reduce((s, l) => s + l.qty, 0)} items.
        Nothing has been charged — payment is arranged with the factory on confirmation.</p>

      ${recs.length ? `
      <div style="max-width:760px;margin:40px auto 0;text-align:left">
        <p class="eyebrow" style="margin-bottom:12px">Others on this system usually add</p>
        <div class="recs">
          ${recs.map(r => `
            <a class="rec" href="${r.href || '/products/'}">
              <span class="im"><img src="${r.gallery[0]}" alt="${r.t}" loading="lazy"></span>
              <span class="bd">
                <span class="t">${r.t}</span>
                <span class="why">${r.plain}</span>
                <span class="ft"><span class="pr">${r.flat ? '' : 'From '}${zar(r.from)}</span></span>
              </span>
            </a>`).join('')}
        </div>
      </div>` : ''}

      <div style="display:flex;gap:10px;justify-content:center;margin-top:34px;flex-wrap:wrap">
        <a class="btn btn--go" href="/products/">Keep shopping
          <span class="dot"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg></span></a>
        <a class="btn" href="tel:+27114378903">Call the factory</a>
      </div>
    </div>`
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

initCart()
initHero()
renderSummary()
