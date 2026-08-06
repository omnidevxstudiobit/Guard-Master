import { initCart, initHero, cartStore } from './app.js'
import { PRODUCTS, byId, zar } from '../data/products.js'
import { OV, SETTINGS, orderLog, fireWebhooks } from '../data/overrides.js'

const $ = s => document.querySelector(s)
const $$ = s => Array.from(document.querySelectorAll(s))
/* admin-sourced strings (codes, notes) render through this — admin data
   is semi-trusted, and a stray `<` must not break the totals block */
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

/* SA VAT is 15% and every published price already includes it, so the VAT
   line is the component inside the total, not something added on top. */
const VAT_RATE = 0.15
const vatPart = (incl) => incl * VAT_RATE / (1 + VAT_RATE)

/* ── summary ──────────────────────────────────────────────────── */
function lines () { return cartStore.read() }

/* ── promo codes — issued by the owner in /admin/ Discounts. Percent
      codes take a share; amount codes (incl. gift codes) hold a ZAR
      value and never take the total below zero. Minimum-purchase and
      active-date rules are enforced here with the reason spelled out,
      and re-checked at submit. ──────────────────────────────────── */
let applied = null
const dayStart = (s) => { const d = new Date(s + 'T00:00:00'); return isNaN(d) ? null : d }
const dayEnd = (s) => { const d = new Date(s + 'T23:59:59.999'); return isNaN(d) ? null : d }
const findCode = (code) =>
  (Array.isArray(OV.discounts) ? OV.discounts : []).find(d =>
    d && typeof d.code === 'string' &&
    d.code.trim().toLowerCase() === code.trim().toLowerCase())
const prettyDate = (s) => {
  const d = dayStart(s)
  return d ? d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : s
}
const codeState = (d, goods) => {
  if (!d) return { why: 'That code is not valid.' }
  if (d.redeemedAt) return { why: 'That code has already been redeemed.' }
  if (d.active === false) return { why: 'That code is not active.' }
  const at = new Date()
  if (d.startsAt && dayStart(d.startsAt) && at < dayStart(d.startsAt)) {
    return { why: `That code only starts on ${prettyDate(d.startsAt)}.` }
  }
  if (d.endsAt && dayEnd(d.endsAt) && at > dayEnd(d.endsAt)) {
    return { why: `That code expired on ${prettyDate(d.endsAt)}.` }
  }
  if (Number(d.minZar) > 0 && goods < Number(d.minZar)) {
    return { why: `That code needs a minimum order of ${zar(Number(d.minZar))}.` }
  }
  return { ok: true }
}
const discountOf = (goods) => {
  if (!applied) return 0
  const v = Number(applied.value) || 0
  return applied.kind === 'percent'
    ? goods * Math.min(100, Math.max(0, v)) / 100
    : Math.min(Math.max(0, v), goods)
}
function wirePromo () {
  const input = $('#promo'), btn = $('#promoApply'), msg = $('#promoMsg')
  if (!input || !btn) return
  const attempt = () => {
    const raw = input.value.trim()
    if (!raw) { applied = null; msg.textContent = ''; msg.className = 'promo-msg'; renderSummary(); return }
    const hit = findCode(raw)
    const goods = lines().reduce((s, l) => s + l.unit * l.qty, 0)
    const state = codeState(hit, goods)
    if (state.ok) {
      applied = hit
      msg.textContent = hit.kind === 'percent'
        ? `${hit.code} — ${hit.value}% off applied`
        : `${hit.code} — ${zar(Number(hit.value) || 0)} off applied`
      msg.className = 'promo-msg ok'
    } else {
      applied = null
      msg.textContent = state.why
      msg.className = 'promo-msg err'
    }
    renderSummary()
  }
  btn.addEventListener('click', attempt)
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); attempt() } })
}

/* fulfilment options can be switched off in /admin/ Checkout settings —
   but never both, a checkout must keep at least one way to fulfil */
function applyCheckoutSettings () {
  const co = SETTINGS.checkout || {}
  const radios = $$('input[name="fulfil"]')
  const collect = radios.find(r => r.value === 'collect')
  const deliver = radios.find(r => r.value === 'deliver')
  if (co.delivery === false && co.collection === false) return
  if (co.delivery === false && deliver) {
    deliver.closest('label').hidden = true
    if (deliver.checked) { collect.checked = true }
  }
  if (co.collection === false && collect) {
    collect.closest('label').hidden = true
    if (collect.checked) { deliver.checked = true; deliver.dispatchEvent(new Event('change')) }
  }
}

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
  const disc = discountOf(goods)
  const total = goods - disc
  const deliver = $('input[name="fulfil"]:checked')?.value === 'deliver'
  const note = typeof SETTINGS.checkout?.note === 'string' && SETTINGS.checkout.note.trim()

  tot.innerHTML = `
    <div class="sum"><span class="k">Goods</span><span class="v">${zar(goods)}</span></div>
    ${disc > 0 ? `<div class="sum"><span class="k">Discount (${esc(applied.code)})</span><span class="v">−${zar(disc)}</span></div>` : ''}
    <div class="sum"><span class="k">of which VAT (15%)</span><span class="v">${zar(vatPart(total))}</span></div>
    <div class="sum"><span class="k">${deliver ? 'Delivery' : 'Collection'}</span>
      <span class="v">${deliver ? 'Quoted on dispatch' : 'Free'}</span></div>
    <div class="sum total"><span class="k">Total</span><span class="v">${zar(total)}</span></div>
    ${deliver ? '<p class="vat" style="font-family:var(--mono);font-size:10.5px;color:var(--muted);margin:6px 0 0">Freight is confirmed against your address before anything is dispatched.</p>' : ''}
    ${note ? `<p class="vat" style="font-family:var(--mono);font-size:10.5px;color:var(--muted);margin:6px 0 0">${esc(SETTINGS.checkout.note.trim())}</p>` : ''}`

  $('#sumCount').textContent = `${units} item${units > 1 ? 's' : ''}`
  $('#place').disabled = false
  $('#place').style.opacity = ''
  $('#placeLabel').textContent = `Place order · ${zar(total)}`
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

  // the applied code's rules are re-checked at the moment of ordering —
  // the cart may have changed since it was applied
  if (applied) {
    const state = codeState(applied, goods)
    if (!state.ok) {
      applied = null
      const msg = $('#promoMsg')
      msg.textContent = state.why + ' It has been removed from the order.'
      msg.className = 'promo-msg err'
      renderSummary()
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
  }
  const disc = discountOf(goods)
  const total = goods - disc

  // a code that zeroes the whole order can't be self-served — redemption
  // against real goods is the factory's call (adversarial review finding)
  if (total <= 0) {
    const msg = $('#promoMsg')
    msg.textContent = `${applied?.code || 'That code'} covers the whole order — call the factory to redeem it against this purchase.`
    msg.className = 'promo-msg err'
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
  const deliver = $('input[name="fulfil"]:checked').value === 'deliver'
  const recs = recommendations(order)

  // recorded locally (the admin Orders section reads this log) and pushed
  // to any webhook the owner registered; no server yet, so no POST here
  const placed = {
    ref, placedAt: new Date().toISOString(), goods, total, deliver,
    status: 'placed',
    discount: applied ? { code: applied.code, kind: applied.kind, value: applied.value, amount: disc } : null,
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
  orderLog.add(placed)
  fireWebhooks('orders/create', placed)

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
      <p style="margin-top:14px"><b style="color:var(--ink)">${zar(total)}</b> incl. VAT${disc > 0 ? ` (${esc(applied.code)} saved ${zar(disc)})` : ''} · ${order.reduce((s, l) => s + l.qty, 0)} items.
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
applyCheckoutSettings()
wirePromo()
renderSummary()
