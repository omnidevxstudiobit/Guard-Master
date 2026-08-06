/* /admin/ — the owner's console. Hash-routed sections, every one built
   on the GM.* API namespaces in api.js. Edits are drafts (live-previewed
   on the storefront in this browser) until Publish commits them. */

import { GM, PHOTO_POOL, TOPICS } from './api.js'
import * as store from './store.js'
import { zar, CATALOGUE } from '../../data/products.js'
import { SA_CITIES, US_CITIES } from '../../data/map-cities.js'

const $ = (s, r = document) => r.querySelector(s)
let view = $('#view')
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const money = (zarAmt) => `${zar(zarAmt)} <span style="color:var(--muted);font-size:11px">(R${(Number(zarAmt) || 0).toFixed(2)})</span>`

let toastTimer
function toast (msg, err = false) {
  let t = $('#admToast')
  if (!t) { t = document.createElement('div'); t.id = 'admToast'; t.className = 'adm-toast'; document.body.appendChild(t) }
  t.textContent = msg
  t.classList.toggle('err', err)
  t.classList.add('show')
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200)
}
const guard = (fn) => { try { return fn() } catch (e) { toast(e.message, true) } }

/* ── auth gate — honest lock: keeps the console out of casual reach;
      the GitHub token (never stored here in published data) is the
      real boundary, since only it can change the live site ───────── */
const sha256 = async (s) => {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('')
}
async function ensureAuth () {
  if (sessionStorage.getItem('gm_admin_unlocked') === '1') return true
  const saved = store.get('settings.adminHash', null)
  return new Promise((resolve) => {
    const gate = document.createElement('div')
    gate.className = 'adm-gate'
    gate.innerHTML = `
      <form class="card glass">
        <h1>${saved ? 'Guard Master admin' : 'Set an admin passphrase'}</h1>
        <p>${saved
          ? 'Enter the passphrase to open the console.'
          : 'First visit: choose a passphrase for this console. It gates the screen — the GitHub publish token remains the real key to the live site.'}</p>
        <div class="adm-f"><input type="password" id="gatePass" autocomplete="${saved ? 'current-password' : 'new-password'}" aria-label="Passphrase"></div>
        <button class="btn btn--go" type="submit" style="width:100%;justify-content:center">${saved ? 'Unlock' : 'Set passphrase'}</button>
        <p class="err" id="gateErr"></p>
      </form>`
    document.body.appendChild(gate)
    const input = $('#gatePass', gate)
    input.focus()
    gate.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault()
      const v = input.value
      if (v.length < 4) { $('#gateErr', gate).textContent = 'At least 4 characters.'; return }
      const hex = await sha256(v)
      if (saved && hex !== saved) { $('#gateErr', gate).textContent = 'That is not it.'; input.select(); return }
      if (!saved) { store.set('settings.adminHash', hex); toast('Passphrase set — publish to make it stick on other devices') }
      sessionStorage.setItem('gm_admin_unlocked', '1')
      gate.remove()
      resolve(true)
    })
  })
}

/* ── nav / router ─────────────────────────────────────────────── */
const NAV = [
  ['Store', [['dashboard', 'Dashboard'], ['orders', 'Orders'], ['draft-orders', 'Draft orders'], ['customers', 'Customers']]],
  ['Catalogue', [['products', 'Products'], ['collections', 'Collections'], ['metafields', 'Metafields'], ['discounts', 'Discounts & gifts']]],
  ['Content', [['store-info', 'Store info & homepage'], ['media', 'Media & files'], ['pages', 'Pages & blog'], ['locations', 'Locations (maps)']]],
  ['System', [['checkout-settings', 'Checkout'], ['webhooks', 'Webhooks'], ['api', 'API console'], ['publish', 'Publish']]],
]
function paintNav () {
  const cur = (location.hash.replace(/^#\//, '') || 'dashboard').replace(/^product\/.+$/, 'products')
  $('#admNav').innerHTML = NAV.map(([grp, items]) => `
    <span class="grp">${grp}</span>
    ${items.map(([id, label]) => `
      <a href="#/${id}" class="${cur === id ? 'on' : ''}">${label}
        ${id === 'publish' && store.dirty() ? `<span class="pin">${Object.keys(store.drafts).length} draft</span>` : ''}
      </a>`).join('')}`).join('')
}

const head = (h1, p, extra = '') =>
  `<div class="adm-h"><div><h1>${h1}</h1><p>${p}</p></div>${extra}</div>`

/* ══ Sections ══════════════════════════════════════════════════ */
const SECTIONS = {

  /* ── dashboard ── */
  dashboard () {
    const os = GM.orders.list()
    const revenue = os.filter(o => o.status !== 'cancelled').reduce((s, o) => s + (o.total ?? o.goods ?? 0), 0)
    const live = GM.products.list({ includeHidden: false }).length
    const all = GM.products.list().length
    const recent = os.slice(0, 6)
    view.innerHTML = head('Dashboard', 'What the store is doing. Orders and customers are recorded in this browser until a backend exists — export anything you need to keep.') + `
      <div class="adm-kpis">
        <div class="adm-card kpi"><b>${os.length}</b><span>orders recorded</span></div>
        <div class="adm-card kpi"><b>${zar(revenue)}</b><span>order value</span></div>
        <div class="adm-card kpi"><b>${live}/${all}</b><span>products live</span></div>
        <div class="adm-card kpi"><b>${GM.discounts.list().filter(d => d.active !== false).length}</b><span>active codes</span></div>
        <div class="adm-card kpi"><b>${store.dirty() ? Object.keys(store.drafts).length : 0}</b><span>unpublished drafts</span></div>
      </div>
      <div class="adm-card"><h2>Recent orders</h2>
        ${recent.length ? `<table class="adm-tbl"><tr><th>Ref</th><th>Placed</th><th>Customer</th><th>Total</th><th>Status</th></tr>
          ${recent.map(o => `<tr><td><a href="#/orders">${esc(o.ref)}</a></td>
            <td>${new Date(o.placedAt).toLocaleString()}</td>
            <td>${esc(o.customer?.name || '—')}</td>
            <td class="num">${zar(o.total ?? o.goods)}</td>
            <td><span class="pill-st ${esc(o.status || 'placed')}">${esc(o.status || 'placed')}</span></td></tr>`).join('')}
        </table>` : '<p class="adm-note">No orders recorded yet. Place one on the storefront and it lands here.</p>'}
      </div>
      <div class="adm-card"><h2>Quick actions</h2>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn btn--sm" href="#/products">Change a price</a>
          <a class="btn btn--sm" href="#/store-info">Change the homepage cover</a>
          <a class="btn btn--sm" href="#/discounts">Issue a discount code</a>
          <a class="btn btn--sm" href="/" target="_blank" rel="noopener">Open the storefront ↗</a>
        </div>
      </div>`
  },

  /* ── orders ── */
  orders () {
    const os = GM.orders.list()
    view.innerHTML = head('Orders', 'Placed on this browser\'s storefront. Fulfil, collect or cancel — status changes fire the orders/fulfilled webhook.') + `
      <div class="adm-card">${os.length ? `<table class="adm-tbl">
        <tr><th>Ref</th><th>Placed</th><th>Customer</th><th>Lines</th><th>Total</th><th>Status</th><th></th></tr>
        ${os.map(o => `<tr>
          <td><b>${esc(o.ref)}</b></td>
          <td>${new Date(o.placedAt).toLocaleDateString()}</td>
          <td>${esc(o.customer?.name || '—')}<br><span style="color:var(--muted);font-size:12px">${esc(o.customer?.email || '')}</span></td>
          <td>${(o.lines || []).map(l => `${l.qty}× ${esc(l.t)}`).join('<br>')}</td>
          <td class="num">${zar(o.total ?? o.goods)}${o.discount ? `<br><span style="color:var(--muted);font-size:11px">${esc(o.discount.code)} −${zar(o.discount.amount)}</span>` : ''}</td>
          <td><span class="pill-st ${esc(o.status || 'placed')}">${esc(o.status || 'placed')}</span></td>
          <td style="white-space:nowrap">
            <button class="btn btn--sm" data-st="fulfilled" data-ref="${esc(o.ref)}">Fulfilled</button>
            <button class="btn btn--sm" data-st="collected" data-ref="${esc(o.ref)}">Collected</button>
            <button class="btn btn--sm btn--danger" data-st="cancelled" data-ref="${esc(o.ref)}">Cancel</button>
          </td></tr>`).join('')}
      </table>` : '<p class="adm-note">Nothing yet — orders placed at checkout appear here (and in the gm_orders webhook payloads).</p>'}</div>`
    view.addEventListener('click', (e) => {
      const b = e.target.closest('[data-st]')
      if (!b) return
      GM.orders.updateStatus(b.dataset.ref, b.dataset.st)
      toast(`${b.dataset.ref} → ${b.dataset.st}`)
      render()
    })
  },

  /* ── customers ── */
  customers () {
    const cs = GM.customerProfile.list()
    view.innerHTML = head('Customers', 'Derived from the order log — no accounts backend exists, so this is the honest customer record: who ordered, what, and where it went.') + `
      <div class="adm-card">${cs.length ? `<table class="adm-tbl">
        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Value</th><th>Addresses</th></tr>
        ${cs.map(c => `<tr><td><b>${esc(c.name)}</b>${c.company ? `<br><span style="color:var(--muted);font-size:12px">${esc(c.company)}</span>` : ''}</td>
          <td>${esc(c.email)}</td><td>${esc(c.phone || '—')}</td>
          <td class="num">${c.orders}</td><td class="num">${zar(c.totalZar)}</td>
          <td style="font-size:12px;color:var(--muted)">${GM.customerAddress.forCustomer(c.email).map(a => esc(`${a.street}, ${a.city}`)).join('<br>') || 'collect'}</td></tr>`).join('')}
      </table>` : '<p class="adm-note">No customers yet — they appear with their first order.</p>'}</div>`
  },

  /* ── products: ordered list + quick edits; Edit opens the full
        per-product editor (photos, options, pairs, everything) ── */
  products () {
    const order = GM.products.order()
    const ps = order.map(GM.products.get)
    view.innerHTML = head('Products', 'Everything about every product is controlled here. ▲▼ decides who comes first on the home grid and the catalogue; Edit opens the full editor — photos, sizes/options, price, copy and "you may also like". Prices are entered in ZAR (the pricing source of truth); the storefront shows dollars.') + `
      <div class="adm-card"><table class="adm-tbl">
        <tr><th>Order</th><th></th><th>Product</th><th>From price (ZAR)</th><th>Shows as</th><th>State</th><th></th></tr>
        ${ps.map((p, i) => `<tr data-id="${esc(p.id)}">
          <td style="white-space:nowrap">
            <button class="btn btn--sm" data-move="-1" ${i === 0 ? 'disabled' : ''} aria-label="Move ${esc(p.t)} up">▲</button>
            <button class="btn btn--sm" data-move="1" ${i === ps.length - 1 ? 'disabled' : ''} aria-label="Move ${esc(p.t)} down">▼</button>
          </td>
          <td><img class="im" src="${esc(p.gallery[0])}" alt=""></td>
          <td><input data-k="t" value="${esc(p.t)}" style="width:100%;min-width:170px"><br>
              <span style="font-family:var(--mono);font-size:10px;color:var(--muted)">${esc(p.id)} · ${p.gallery.length} photos · ${p.options.length} option sets</span></td>
          <td><input data-k="from" type="number" step="0.01" min="0" value="${p.from}" style="width:110px"></td>
          <td class="num">${zar(p.from)}</td>
          <td><span class="pill-st ${p.hidden ? 'hidden' : 'live'}">${p.hidden ? 'hidden' : 'live'}</span></td>
          <td style="white-space:nowrap">
            <a class="btn btn--sm" href="#/product/${esc(p.id)}">Edit</a>
            <button class="btn btn--sm" data-act="toggle">${p.hidden ? 'Show' : 'Hide'}</button>
          </td></tr>`).join('')}
      </table></div>
      <div class="adm-card"><h2>Home best-sellers rail</h2>
        <div class="adm-f"><label>Product ids, in rail order (comma-separated)</label>
          <input id="bestRow" value="${esc(GM.products.bestSellers().join(', '))}"></div>
        <p class="adm-note">Available ids: ${CATALOGUE.map(p => p.id).join(', ')}. Blank = the built-in eight.</p></div>`
    view.addEventListener('change', (e) => {
      if (e.target.id === 'bestRow') {
        guard(() => { GM.products.setBestSellers(e.target.value.split(',').map(s => s.trim()).filter(Boolean)); toast('rail order saved (draft)'); paintNav() })
        return
      }
      const inp = e.target.closest('input[data-k]')
      if (!inp) return
      const tr = inp.closest('tr')
      const id = tr.dataset.id
      guard(() => {
        GM.products.update(id, { [inp.dataset.k]: inp.value })
        // update in place — a full render() here would eat the user's
        // focus mid-tab-through (adversarial review finding)
        tr.querySelector('td.num').textContent = zar(GM.products.get(id).from)
        toast(`${id} updated (draft)`)
        paintNav()
      })
    })
    view.addEventListener('click', (e) => {
      const mv = e.target.closest('[data-move]')
      if (mv) {
        const id = mv.closest('tr').dataset.id
        guard(() => {
          const ord = GM.products.order()
          const i = ord.indexOf(id)
          const j = i + Number(mv.dataset.move)
          if (j < 0 || j >= ord.length) return
          ;[ord[i], ord[j]] = [ord[j], ord[i]]
          GM.products.reorder(ord)
          render()
        })
        return
      }
      const b = e.target.closest('[data-act]')
      if (!b) return
      const id = b.closest('tr').dataset.id
      const p = GM.products.get(id)
      guard(() => {
        p.hidden ? GM.products.show(id) : GM.products.hide(id)
        toast(`${id} ${p.hidden ? 'shown' : 'hidden'} (draft)`)
        render()
      })
    })
  },

  /* ── collections ── */
  collections () {
    const cs = GM.collections.list()
    view.innerHTML = head('Collections', 'The four audience pills. Name and copy feed the home tiles and the category pages; the product list drives each category\'s buy grid.') +
      cs.map(c => `<div class="adm-card" data-id="${esc(c.id)}"><h2>${esc(c.id)}</h2>
        <div class="adm-grid2">
          <div class="adm-f"><label>Name</label><input data-k="name" value="${esc(c.name)}"></div>
          <div class="adm-f"><label>Lede</label><input data-k="lede" value="${esc(c.lede)}"></div>
        </div>
        <div class="adm-f"><label>Blurb</label><input data-k="blurb" value="${esc(c.blurb)}"></div>
        <div class="adm-f"><label>Products (comma-separated ids)</label>
          <input data-k="products" value="${esc((c.products || []).join(', '))}"
                 placeholder="${esc(CATALOGUE.map(p => p.id).join(', '))}"></div>
      </div>`).join('')
    view.addEventListener('change', (e) => {
      const inp = e.target.closest('input[data-k]')
      if (!inp) return
      const id = inp.closest('.adm-card').dataset.id
      const k = inp.dataset.k
      guard(() => {
        GM.collections.update(id, { [k]: k === 'products' ? inp.value.split(',').map(s => s.trim()).filter(Boolean) : inp.value })
        toast(`${id} updated (draft)`)
      })
    })
  },

  /* ── metafields ── */
  metafields () {
    const rows = CATALOGUE.map(p => {
      const mf = GM.metafields.get(p.id)
      return `<div class="adm-card" data-id="${esc(p.id)}"><h2>${esc(p.t)} <span style="font-family:var(--mono);font-size:10px;color:var(--muted)">${esc(p.id)}</span></h2>
        ${Object.entries(mf).map(([k, v]) => `
          <div style="display:flex;gap:8px;margin-bottom:8px">
            <input value="${esc(k)}" disabled style="width:160px">
            <input data-key="${esc(k)}" value="${esc(v)}" style="flex:1">
            <button class="btn btn--sm btn--danger" data-del="${esc(k)}">✕</button>
          </div>`).join('')}
        <div style="display:flex;gap:8px">
          <input data-new="k" placeholder="key" style="width:160px">
          <input data-new="v" placeholder="value" style="flex:1">
          <button class="btn btn--sm" data-add>Add</button>
        </div></div>`
    })
    view.innerHTML = head('Metafields', 'Free key/value pairs per product — spec extras, datasheet links, anything the client sends that has no field. Stored in admin data for future page templates to read.') + rows.join('')
    view.addEventListener('click', (e) => {
      const card = e.target.closest('.adm-card'); if (!card) return
      const id = card.dataset.id
      if (e.target.closest('[data-add]')) {
        const k = card.querySelector('[data-new="k"]').value.trim()
        const v = card.querySelector('[data-new="v"]').value.trim()
        if (!k) return toast('key required', true)
        guard(() => { GM.metafields.set(id, k, v); toast(`${id}.${k} saved (draft)`); render() })
      }
      const del = e.target.closest('[data-del]')
      if (del) guard(() => { GM.metafields.set(id, del.dataset.del, null); render() })
    })
    view.addEventListener('change', (e) => {
      const inp = e.target.closest('input[data-key]'); if (!inp) return
      const id = inp.closest('.adm-card').dataset.id
      guard(() => { GM.metafields.set(id, inp.dataset.key, inp.value); toast('saved (draft)') })
    })
  },

  /* ── discounts & gift codes ── */
  discounts () {
    const ds = GM.discounts.list()
    view.innerHTML = head('Discounts & gift codes', 'Codes the checkout accepts. Percent codes take a share of goods; amount codes (and issued gift codes) hold a ZAR value. Amounts never take a total below zero.') + `
      <div class="adm-grid2">
        <div class="adm-card"><h2>New discount code</h2>
          <div class="adm-f"><label>Code</label><input id="dCode" placeholder="LAUNCH10" style="text-transform:uppercase"></div>
          <div class="adm-grid2">
            <div class="adm-f"><label>Kind</label><select id="dKind"><option value="percent">Percent off</option><option value="amount">Amount off (ZAR)</option></select></div>
            <div class="adm-f"><label>Value</label><input id="dVal" type="number" min="0" step="0.01" placeholder="10"></div>
          </div>
          <button class="btn btn--sm" id="dAdd">Create code</button></div>
        <div class="adm-card"><h2>Issue a gift code</h2>
          <p class="adm-note" style="margin:0 0 10px">Generates a GM-GIFT amount code. Redemption is manual until a backend can decrement balances — mark it redeemed after honouring it.</p>
          <div class="adm-f"><label>Value (ZAR)</label><input id="gVal" type="number" min="1" step="1" placeholder="500"></div>
          <button class="btn btn--sm" id="gAdd">Issue gift code</button></div>
      </div>
      <div class="adm-card"><h2>All codes</h2>${ds.length ? `<table class="adm-tbl">
        <tr><th>Code</th><th>Kind</th><th>Value</th><th>State</th><th></th></tr>
        ${ds.map(d => `<tr>
          <td><b>${esc(d.code)}</b>${d.giftcard ? ' <span class="pill-st draft">gift</span>' : ''}</td>
          <td>${esc(d.kind)}</td>
          <td class="num">${d.kind === 'percent' ? esc(String(d.value)) + '%' : zar(d.value)}</td>
          <td><span class="pill-st ${d.active !== false ? 'live' : 'hidden'}">${d.active !== false ? 'active' : 'off'}</span></td>
          <td style="white-space:nowrap">
            <button class="btn btn--sm" data-tog="${esc(d.code)}">${d.active !== false ? 'Deactivate' : 'Activate'}</button>
            <button class="btn btn--sm btn--danger" data-rm="${esc(d.code)}">Delete</button>
          </td></tr>`).join('')}
      </table>` : '<p class="adm-note">No codes yet.</p>'}</div>`
    $('#dAdd').addEventListener('click', () => guard(() => {
      GM.discounts.create({ code: $('#dCode').value, kind: $('#dKind').value, value: $('#dVal').value })
      toast('code created (draft)'); render()
    }))
    $('#gAdd').addEventListener('click', () => guard(() => {
      const g = GM.giftCards.issue(Number($('#gVal').value))
      toast(`issued ${g.code} (draft)`); render()
    }))
    view.addEventListener('click', (e) => {
      const tog = e.target.closest('[data-tog]'); const rm = e.target.closest('[data-rm]')
      if (tog) guard(() => { const d = ds.find(x => x.code === tog.dataset.tog); GM.discounts.update(d.code, { active: d.active === false }); render() })
      if (rm) guard(() => { GM.discounts.remove(rm.dataset.rm); render() })
    })
  },

  /* ── draft orders ── */
  'draft-orders' () {
    const drafts = GM.draftOrders.list()
    const opts = GM.products.list().map(p => `<option value="${esc(p.id)}">${esc(p.t)} — ${zar(p.from)}</option>`).join('')
    view.innerHTML = head('Draft orders', 'Compose an order for a phone/email customer — negotiated unit prices allowed — then open it in the real checkout to place it.') + `
      <div class="adm-card"><h2>Compose</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">
          <div class="adm-f" style="flex:2;margin:0"><label>Product</label><select id="doProd">${opts}</select></div>
          <div class="adm-f" style="width:90px;margin:0"><label>Qty</label><input id="doQty" type="number" min="1" value="1"></div>
          <div class="adm-f" style="width:130px;margin:0"><label>Unit ZAR (blank = list)</label><input id="doUnit" type="number" min="0" step="0.01"></div>
          <button class="btn btn--sm" id="doAdd">Add line</button>
        </div>
        <div id="doLines" style="margin-top:12px"></div>
        <div style="display:flex;gap:8px;margin-top:10px">
          <input id="doNote" placeholder="note (customer, quote ref…)" style="flex:1;border:1px solid rgba(20,18,26,.14);border-radius:10px;padding:8px 12px;font:inherit;font-size:13.5px">
          <button class="btn btn--sm" id="doSave">Save draft order</button>
        </div></div>
      <div class="adm-card"><h2>Saved drafts</h2>${drafts.length ? `<table class="adm-tbl">
        <tr><th>Id</th><th>Note</th><th>Lines</th><th>Total</th><th></th></tr>
        ${drafts.map(d => `<tr><td><b>${esc(d.id)}</b></td><td>${esc(d.note || '—')}</td>
          <td>${d.lines.map(l => `${l.qty}× ${esc(l.t)}`).join('<br>')}</td>
          <td class="num">${zar(d.lines.reduce((s, l) => s + l.unit * l.qty, 0))}</td>
          <td style="white-space:nowrap">
            <button class="btn btn--sm" data-open="${esc(d.id)}">Open in checkout</button>
            <button class="btn btn--sm btn--danger" data-rm="${esc(d.id)}">Delete</button>
          </td></tr>`).join('')}</table>` : '<p class="adm-note">None saved.</p>'}</div>`
    let pending = []
    const paintLines = () => {
      $('#doLines').innerHTML = pending.length
        ? pending.map((l, i) => `<div style="display:flex;gap:10px;align-items:center;font-size:13.5px;padding:4px 0">
            <span style="flex:1">${l.qty}× ${esc(l.t)} @ ${zar(l.unit)}</span>
            <button class="btn btn--sm btn--danger" data-pi="${i}">✕</button></div>`).join('')
        : '<p class="adm-note">No lines yet.</p>'
    }
    paintLines()
    $('#doAdd').addEventListener('click', () => {
      const p = GM.products.get($('#doProd').value)
      const qty = Math.max(1, Number($('#doQty').value) || 1)
      const unit = Number($('#doUnit').value) > 0 ? Number($('#doUnit').value) : p.from
      pending.push({ id: p.id, t: p.t, unit, qty, img: p.gallery[0], spec: p.spec })
      paintLines()
    })
    $('#doLines').addEventListener('click', (e) => {
      const b = e.target.closest('[data-pi]'); if (!b) return
      pending.splice(Number(b.dataset.pi), 1); paintLines()
    })
    $('#doSave').addEventListener('click', () => guard(() => {
      GM.draftOrders.create({ lines: pending, note: $('#doNote').value.trim() })
      pending = []; toast('draft order saved'); render()
    }))
    view.addEventListener('click', (e) => {
      const open = e.target.closest('[data-open]'); const rm = e.target.closest('[data-rm]')
      if (open) guard(() => GM.draftOrders.openInCheckout(open.dataset.open))
      if (rm && rm.dataset.rm?.startsWith('D-')) guard(() => { GM.draftOrders.remove(rm.dataset.rm); render() })
    })
  },

  /* ── store info & homepage ── */
  'store-info' () {
    const s = GM.storeInformation.get()
    view.innerHTML = head('Store info & homepage', 'The promo bar message, the homepage cover photo, the enquiry email, and the ZAR→USD display rate the whole site converts through.') + `
      <div class="adm-card"><h2>Homepage cover photo</h2>
        <div class="adm-pool" id="heroPool">
          ${GM.media.list().map(src => `<button type="button" data-src="${esc(src)}" class="${src === s.hero ? 'on' : ''}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('')}
        </div>
        <p class="adm-note">All real client photography. Uploads (Media & files) join this pool after publishing.</p></div>
      <div class="adm-card"><h2>Announcements & contact</h2>
        <div class="adm-f"><label>Promo bar message</label><input id="siPromo" value="${esc(s.promo)}" placeholder="Now shipping across the continental US — request a quote"></div>
        <div class="adm-grid2">
          <div class="adm-f"><label>Enquiry email (support widget + estimator)</label><input id="siEmail" value="${esc(s.email)}"></div>
          <div class="adm-f"><label>ZAR per USD display rate</label><input id="siRate" type="number" step="0.01" min="1" value="${s.rateZarPerUsd}"></div>
        </div>
        <p class="adm-note"><b>The rate changes every displayed dollar price.</b> Factory ZAR data stays the source of truth; this only converts the display, exactly like the site has always worked.</p></div>`
    $('#heroPool').addEventListener('click', (e) => {
      const b = e.target.closest('[data-src]'); if (!b) return
      guard(() => { GM.storeInformation.update({ hero: b.dataset.src }); toast('cover set (draft)'); render() })
    })
    for (const [id, key] of [['siPromo', 'promo'], ['siEmail', 'email'], ['siRate', 'rateZarPerUsd']]) {
      $('#' + id).addEventListener('change', (e) => guard(() => {
        GM.storeInformation.update({ [key]: e.target.value }); toast('saved (draft)')
      }))
    }
  },

  /* ── checkout settings ── */
  'checkout-settings' () {
    const s = GM.checkout.settings()
    view.innerHTML = head('Checkout', 'Which fulfilment routes are offered, plus a note shown under the totals. Validation, the VAT-inside display and the no-payment honesty line are fixed site rules.') + `
      <div class="adm-card"><h2>Fulfilment options</h2>
        <label style="display:flex;gap:10px;align-items:center;font-size:14px;padding:6px 0">
          <input type="checkbox" id="coCollect" ${s.collection !== false ? 'checked' : ''}> Collection from the factory (free)</label>
        <label style="display:flex;gap:10px;align-items:center;font-size:14px;padding:6px 0">
          <input type="checkbox" id="coDeliver" ${s.delivery !== false ? 'checked' : ''}> Delivery (freight quoted on dispatch)</label>
        <p class="adm-note">At least one stays on — the console refuses to switch both off.</p></div>
      <div class="adm-card"><h2>Note under the totals</h2>
        <div class="adm-f"><input id="coNote" value="${esc(s.note || '')}" placeholder="e.g. December orders dispatch from 5 Jan"></div></div>`
    const push = () => guard(() => {
      GM.checkout.update({ collection: $('#coCollect').checked, delivery: $('#coDeliver').checked, note: $('#coNote').value.trim() })
      toast('checkout settings saved (draft)')
    })
    ;['coCollect', 'coDeliver', 'coNote'].forEach(id => $('#' + id).addEventListener('change', () => {
      if (!$('#coCollect').checked && !$('#coDeliver').checked) { toast('one fulfilment option must stay on', true); render(); return }
      push()
    }))
  },

  /* ── media & files ── */
  media () {
    const pend = GM.files.pending()
    view.innerHTML = head('Media & files', 'The photo pool the storefront draws from. Queued uploads are committed to public/images/uploads/ when you publish — until then they exist only in this browser.') + `
      <div class="adm-card"><h2>Upload</h2>
        <input type="file" id="fUp" accept="image/*" multiple>
        ${pend.length ? `<table class="adm-tbl" style="margin-top:12px"><tr><th>Queued file</th><th>Size</th><th></th></tr>
          ${pend.map(f => `<tr><td>${esc(f.name)}</td><td class="num">${(f.size / 1024).toFixed(0)} KB</td>
            <td><button class="btn btn--sm btn--danger" data-rm="${esc(f.name)}">Remove</button></td></tr>`).join('')}</table>` : ''}
      </div>
      <div class="adm-card"><h2>Published pool</h2>
        <div class="adm-pool">${GM.media.list().map(src => `
          <button type="button" data-copy="${esc(src)}" title="Click to copy path"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('')}</div>
        <p class="adm-note">Click a photo to copy its path. Videos: ${GM.media.videos().map(esc).join(' · ')}</p></div>`
    $('#fUp').addEventListener('change', async (e) => {
      for (const file of e.target.files) {
        if (file.size > 2.5 * 1024 * 1024) { toast(`${file.name} is over 2.5 MB — resize it first`, true); continue }
        const b64 = await new Promise((res) => {
          const r = new FileReader()
          r.onload = () => res(String(r.result).split(',')[1])
          r.readAsDataURL(file)
        })
        GM.files.queue({ name: file.name, b64, size: file.size })
      }
      toast('queued — publishes with the next publish'); render()
    })
    view.addEventListener('click', async (e) => {
      const rm = e.target.closest('[data-rm]')
      if (rm) { GM.files.remove(rm.dataset.rm); render(); return }
      const cp = e.target.closest('[data-copy]')
      if (cp) { try { await navigator.clipboard.writeText(cp.dataset.copy); toast('path copied') } catch { toast(cp.dataset.copy) } }
    })
  },

  /* ── pages & blog ── */
  pages () {
    const all = [...GM.pages.list(), ...GM.blogs.list()]
    view.innerHTML = head('Pages & blog', 'Owner-authored content, served at /pages/?s=slug. Blank lines split paragraphs. Blog posts also list on /pages/ itself.') + `
      <div class="adm-card"><h2>Write</h2>
        <div class="adm-grid2">
          <div class="adm-f"><label>Title</label><input id="pgTitle" placeholder="Installation guide"></div>
          <div class="adm-grid2">
            <div class="adm-f"><label>Slug (blank = from title)</label><input id="pgSlug" placeholder="installation-guide"></div>
            <div class="adm-f"><label>Kind</label><select id="pgKind"><option value="page">Page</option><option value="post">Blog post</option></select></div>
          </div>
        </div>
        <div class="adm-f"><label>Body</label><textarea id="pgBody" rows="8" placeholder="Plain paragraphs. A blank line starts a new one."></textarea></div>
        <button class="btn btn--sm" id="pgSave">Save (draft)</button></div>
      <div class="adm-card"><h2>Published & drafted</h2>${all.length ? `<table class="adm-tbl">
        <tr><th>Title</th><th>Kind</th><th>Slug</th><th>Updated</th><th></th></tr>
        ${all.map(p => `<tr><td><b>${esc(p.title)}</b></td><td>${esc(p.kind)}</td>
          <td><a href="/pages/?s=${esc(p.slug)}" target="_blank" rel="noopener">${esc(p.slug)} ↗</a></td>
          <td>${new Date(p.updatedAt).toLocaleDateString()}</td>
          <td style="white-space:nowrap">
            <button class="btn btn--sm" data-edit="${esc(p.slug)}">Edit</button>
            <button class="btn btn--sm btn--danger" data-rm="${esc(p.slug)}">Delete</button>
          </td></tr>`).join('')}</table>` : '<p class="adm-note">Nothing written yet.</p>'}</div>`
    $('#pgSave').addEventListener('click', () => guard(() => {
      const kind = $('#pgKind').value
      const save = kind === 'post' ? GM.blogs.save : GM.pages.save
      const p = save({ slug: $('#pgSlug').value, title: $('#pgTitle').value, body: $('#pgBody').value })
      toast(`saved — preview at ${p.url}`); render()
    }))
    view.addEventListener('click', (e) => {
      const ed = e.target.closest('[data-edit]'); const rm = e.target.closest('[data-rm]')
      if (rm) { guard(() => { GM.pages.remove(rm.dataset.rm); render() }); return }
      if (!ed) return
      const p = all.find(x => x.slug === ed.dataset.edit)
      $('#pgTitle').value = p.title; $('#pgSlug').value = p.slug
      $('#pgKind').value = p.kind === 'post' ? 'post' : 'page'; $('#pgBody').value = p.body
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  },

  /* ── locations ── */
  locations () {
    const defs = { sa: SA_CITIES, us: US_CITIES }
    const block = (map, label) => {
      const overridden = GM.locations.get(map)
      const cities = overridden || defs[map]
      return `<div class="adm-card" data-map="${map}"><h2>${label} ${overridden ? '<span class="pill-st draft">overridden</span>' : '<span class="pill-st live">built-in</span>'}</h2>
        <table class="adm-tbl"><tr><th>Name</th><th>Info card copy</th><th>x</th><th>y</th><th>Home</th><th></th></tr>
          ${cities.map((c, i) => `<tr data-i="${i}">
            <td><input data-k="n" value="${esc(c.n)}" style="width:150px"></td>
            <td><input data-k="d" value="${esc(c.d)}" style="width:100%;min-width:200px"></td>
            <td><input data-k="x" type="number" min="0" max="1" step="0.005" value="${c.x}" style="width:74px"></td>
            <td><input data-k="y" type="number" min="0" max="1" step="0.005" value="${c.y}" style="width:74px"></td>
            <td><input data-k="home" type="checkbox" ${c.home ? 'checked' : ''}></td>
            <td><button class="btn btn--sm btn--danger" data-drop="${i}">✕</button></td></tr>`).join('')}
        </table>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn--sm" data-addcity>Add city</button>
          <button class="btn btn--sm" data-save>Save ${map.toUpperCase()} map (draft)</button>
          ${overridden ? '<button class="btn btn--sm" data-reset>Back to built-in</button>' : ''}
        </div></div>`
    }
    view.innerHTML = head('Locations', 'The cities on the two /us/ dot maps. Coordinates are 0–1 inside each map\'s box — nudge, save, and check the page. Keep destination copy honest: shipping destinations, not past projects.') +
      block('sa', 'South Africa — proving ground') + block('us', 'United States — the welcome')
    view.addEventListener('click', (e) => {
      const card = e.target.closest('[data-map]'); if (!card) return
      const map = card.dataset.map
      const readRows = () => Array.from(card.querySelectorAll('tr[data-i]')).map(tr => ({
        n: tr.querySelector('[data-k="n"]').value.trim(),
        d: tr.querySelector('[data-k="d"]').value.trim(),
        x: Number(tr.querySelector('[data-k="x"]').value),
        y: Number(tr.querySelector('[data-k="y"]').value),
        ...(tr.querySelector('[data-k="home"]').checked ? { home: true } : {}),
      })).filter(c => c.n && c.d && c.x >= 0 && c.x <= 1 && c.y >= 0 && c.y <= 1)
      if (e.target.closest('[data-save]')) guard(() => { GM.locations.setCities(map, readRows()); toast(`${map} map saved (draft)`); render() })
      if (e.target.closest('[data-reset]')) guard(() => { GM.locations.reset(map); toast(`${map} map back to built-in`); render() })
      if (e.target.closest('[data-addcity]')) {
        guard(() => { GM.locations.setCities(map, [...readRows(), { n: 'New city', d: 'Shipping destination.', x: .5, y: .5 }]); render() })
      }
      const drop = e.target.closest('[data-drop]')
      if (drop) guard(() => { GM.locations.setCities(map, readRows().filter((_, i) => i !== Number(drop.dataset.drop))); render() })
    })
  },

  /* ── webhooks ── */
  webhooks () {
    const subs = GM.webhooks.list()
    const log = GM.webhooks.deliveries()
    view.innerHTML = head('Webhooks', 'JSON POSTs fired from the shopper\'s browser when events happen (orders/create on checkout, orders/fulfilled from here). Best-effort: a dead endpoint never breaks the storefront. The endpoint must accept cross-origin POSTs including the CORS preflight (OPTIONS) — Zapier, Make and similar hook receivers do.') + `
      <div class="adm-card"><h2>Subscribe</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">
          <div class="adm-f" style="width:180px;margin:0"><label>Topic</label>
            <select id="whTopic">${TOPICS.map(t => `<option>${t}</option>`).join('')}</select></div>
          <div class="adm-f" style="flex:1;min-width:220px;margin:0"><label>Endpoint URL</label>
            <input id="whUrl" placeholder="https://hook.your-service.com/…"></div>
          <button class="btn btn--sm" id="whAdd">Subscribe</button>
          <button class="btn btn--sm" id="whTest">Fire a test</button>
        </div></div>
      <div class="adm-card"><h2>Subscriptions</h2>${subs.length ? `<table class="adm-tbl">
        <tr><th>Topic</th><th>URL</th><th></th></tr>
        ${subs.map((w, i) => `<tr><td><b>${esc(w.topic)}</b></td><td style="word-break:break-all">${esc(w.url)}</td>
          <td><button class="btn btn--sm btn--danger" data-un="${i}">Remove</button></td></tr>`).join('')}</table>`
        : '<p class="adm-note">None. Point one at Zapier/Make/Monday.com to get orders pushed the moment they are placed.</p>'}</div>
      <div class="adm-card"><h2>Recent deliveries</h2>${log.length ? `<table class="adm-tbl">
        <tr><th>When</th><th>Topic</th><th>URL</th><th>Result</th></tr>
        ${log.slice(0, 15).map(d => `<tr><td>${new Date(d.at).toLocaleTimeString()}</td><td>${esc(d.topic)}</td>
          <td style="word-break:break-all">${esc(d.url)}</td><td>${esc(d.result)}</td></tr>`).join('')}</table>` : '<p class="adm-note">Nothing fired yet.</p>'}</div>`
    $('#whAdd').addEventListener('click', () => guard(() => {
      GM.webhooks.subscribe($('#whTopic').value, $('#whUrl').value.trim())
      toast('subscribed (draft — publish to arm it for shoppers)'); render()
    }))
    $('#whTest').addEventListener('click', () => {
      const n = GM.webhooks.test($('#whTopic').value === '*' ? 'orders/create' : $('#whTopic').value)
      toast(n ? `fired at ${n} subscription${n > 1 ? 's' : ''} — check deliveries` : 'no matching subscriptions', !n)
      setTimeout(render, 1200)
    })
    view.addEventListener('click', (e) => {
      const un = e.target.closest('[data-un]')
      if (un) guard(() => { GM.webhooks.unsubscribe(Number(un.dataset.un)); render() })
    })
  },

  /* ── API console ── */
  api () {
    const names = Object.keys(GM)
    view.innerHTML = head('API console', 'The whole surface — every namespace is the same code the console itself runs on, exposed as window.GM. Reads return live data; writes create drafts. Try GM.products.list() or GM.orders.list().') + `
      <div class="adm-card adm-api"><h2>Run a call</h2>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:end">
          <div class="adm-f" style="width:220px;margin:0"><label>Namespace</label>
            <select id="apiNs">${names.map(n => `<option>${n}</option>`).join('')}</select></div>
          <div class="adm-f" style="width:220px;margin:0"><label>Method</label><select id="apiFn"></select></div>
          <div class="adm-f" style="flex:1;min-width:200px;margin:0"><label>Args (JSON array)</label>
            <input id="apiArgs" placeholder='e.g. ["panels", {"from": 1350}]'></div>
          <button class="btn btn--sm" id="apiRun">Run</button>
        </div>
        <pre id="apiOut">// result appears here</pre></div>
      <div class="adm-card adm-api"><h2>Surface</h2>
        ${names.map(n => `<details><summary style="cursor:pointer;font-weight:700;font-size:13.5px;padding:4px 0">${n}</summary>
          ${Object.keys(GM[n]).filter(k => typeof GM[n][k] === 'function').map(k =>
            `<span class="sig">GM.${n}.${k}()</span>`).join('') || '<span class="sig">(data only)</span>'}
        </details>`).join('')}</div>`
    window.GM = GM
    const paintFns = () => {
      const ns = GM[$('#apiNs').value]
      $('#apiFn').innerHTML = Object.keys(ns).filter(k => typeof ns[k] === 'function').map(k => `<option>${k}</option>`).join('')
    }
    paintFns()
    $('#apiNs').addEventListener('change', paintFns)
    $('#apiRun').addEventListener('click', async () => {
      const out = $('#apiOut')
      try {
        const args = $('#apiArgs').value.trim() ? JSON.parse($('#apiArgs').value) : []
        if (!Array.isArray(args)) throw new Error('args must be a JSON array')
        const res = await GM[$('#apiNs').value][$('#apiFn').value](...args)
        out.textContent = JSON.stringify(res, null, 2) ?? 'undefined'
        paintNav()
      } catch (e) { out.textContent = '✗ ' + e.message }
    })
  },

  /* ── publish ── */
  publish () {
    const cfg = store.ghConfig.read()
    const payload = store.publishPayload()
    const nDrafts = Object.keys(store.drafts).length
    view.innerHTML = head('Publish', 'Drafts live only in this browser until published. Publishing commits admin-data.json (and queued uploads) to the GitHub repo — Vercel then deploys, and every visitor sees the change.') + `
      <div class="adm-card"><h2>State</h2>
        <p class="adm-note" style="margin:0">${nDrafts
          ? `<b>${nDrafts} draft key${nDrafts > 1 ? 's' : ''} waiting.</b> The storefront in this browser is previewing them now.`
          : 'No drafts — the console matches the published site.'}</p>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap">
          <button class="btn btn--sm" id="pbExport">Download admin-data.json</button>
          <button class="btn btn--sm btn--danger" id="pbDiscard" ${nDrafts ? '' : 'disabled'}>Discard all drafts</button>
        </div></div>
      <div class="adm-card"><h2>Publish to GitHub</h2>
        <div class="adm-grid2">
          <div class="adm-f"><label>Owner / repo</label><input id="ghRepo" value="${esc(cfg.owner + '/' + cfg.repo)}"></div>
          <div class="adm-f"><label>Branch</label><input id="ghBranch" value="${esc(cfg.branch)}"></div>
        </div>
        <div class="adm-f"><label>Fine-grained token (contents: read/write on this repo)</label>
          <input id="ghToken" type="password" value="${esc(cfg.token)}" placeholder="github_pat_…"></div>
        <p class="adm-note">The token stays in this browser (localStorage) and is never part of the published JSON. Make it fine-grained, single-repo. <b>This token is the real admin credential — treat it like one.</b></p>
        <button class="btn btn--go btn--sm" id="pbGo" ${nDrafts ? '' : 'disabled'} style="margin-top:6px">Publish now</button>
        <pre id="pbLog" style="margin:12px 0 0;padding:12px;border-radius:10px;background:#14121a;color:#e7e5f2;font-size:12px;min-height:44px;white-space:pre-wrap"></pre></div>
      <div class="adm-card adm-api"><h2>What would be published</h2><pre>${esc(JSON.stringify(payload, null, 2))}</pre></div>
      <div class="adm-card"><h2>Passphrase</h2>
        <div class="adm-f"><label>New console passphrase</label><input id="npPass" type="password" autocomplete="new-password"></div>
        <button class="btn btn--sm" id="npSet">Change passphrase</button></div>`
    $('#pbExport').addEventListener('click', () => store.exportJSON())
    $('#pbDiscard').addEventListener('click', () => {
      if (confirm('Throw away every unpublished draft in this browser?')) { store.discard(); toast('drafts discarded'); render() }
    })
    $('#pbGo').addEventListener('click', async () => {
      const [owner, repo] = $('#ghRepo').value.split('/').map(s => s.trim())
      const cfg2 = { owner, repo, branch: $('#ghBranch').value.trim() || 'main', token: $('#ghToken').value.trim() }
      store.ghConfig.write(cfg2)
      const log = $('#pbLog')
      log.textContent = ''
      const line = (m) => { log.textContent += m + '\n' }
      $('#pbGo').disabled = true
      try { await store.publish(cfg2, line); toast('published'); render() }
      catch (e) { line('✗ ' + e.message); toast(e.message, true); $('#pbGo').disabled = false }
    })
    $('#npSet').addEventListener('click', async () => {
      const v = $('#npPass').value
      if (v.length < 4) return toast('at least 4 characters', true)
      store.set('settings.adminHash', await sha256(v))
      toast('passphrase changed (publish to apply beyond this browser)')
    })
  },
}

/* ── per-product editor: photos, price, copy, options, pairs ──── */
function productDetail (id) {
  const p = GM.products.get(id)
  if (!p) { view.innerHTML = head('Unknown product', `No product "${esc(id)}". <a href="#/products">Back to products</a>.`); return }
  const base = CATALOGUE.find(x => x.id === id)
  const href = base.href || `/products/item/?p=${id}`
  const pool = [...new Set([...base.gallery, ...GM.media.list()])].filter(src => !p.gallery.includes(src))

  view.innerHTML = head(esc(p.t),
    `Everything the storefront shows for this product. <a href="#/products">← All products</a> · <a href="${esc(href)}" target="_blank" rel="noopener">View on site ↗</a>`,
    `<span class="pill-st ${p.hidden ? 'hidden' : 'live'}">${p.hidden ? 'hidden' : 'live'}</span>`) + `

    <div class="adm-card"><h2>Price & copy</h2>
      <div class="adm-grid2">
        <div class="adm-f"><label>Title</label><input data-f="t" value="${esc(p.t)}"></div>
        <div class="adm-grid2">
          <div class="adm-f"><label>From price (ZAR)</label><input data-f="from" type="number" step="0.01" min="0" value="${p.from}"></div>
          <div class="adm-f"><label>Shows as</label><input value="${zar(p.from)}" disabled id="usdPrev"></div>
        </div>
      </div>
      <div class="adm-f"><label>Plain-words line (cards)</label><input data-f="plain" value="${esc(p.plain)}"></div>
      <div class="adm-f"><label>Description (catalogue + product page)</label><textarea data-f="d" rows="3">${esc(p.d)}</textarea></div>
      <div class="adm-grid2">
        <div class="adm-f"><label>Spec line</label><input data-f="spec" value="${esc(p.spec)}"></div>
        <div class="adm-f"><label>Lead time note (honest availability, never fake stock)</label><input data-f="lead" value="${esc(p.lead || '')}" placeholder="e.g. ships in 2–3 weeks"></div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn--sm" id="pdToggle">${p.hidden ? 'Show on storefront' : 'Hide from storefront'}</button>
        <button class="btn btn--sm btn--danger" id="pdReset">Reset everything to factory values</button>
      </div></div>

    <div class="adm-card"><h2>Photos</h2>
      <p class="adm-note" style="margin:0 0 12px">First photo = the card and page lead image; second = the card's hover image. Order with ▲▼.</p>
      <table class="adm-tbl">${p.gallery.map((src, i) => `
        <tr><td><img class="im" src="${esc(src)}" alt=""></td>
          <td style="word-break:break-all;font-size:12px;color:var(--muted)">${esc(src)}${i === 0 ? ' <span class="pill-st draft">lead</span>' : i === 1 ? ' <span class="pill-st draft">hover</span>' : ''}</td>
          <td style="white-space:nowrap">
            <button class="btn btn--sm" data-gmove="-1" data-gi="${i}" ${i === 0 ? 'disabled' : ''}>▲</button>
            <button class="btn btn--sm" data-gmove="1" data-gi="${i}" ${i === p.gallery.length - 1 ? 'disabled' : ''}>▼</button>
            <button class="btn btn--sm btn--danger" data-gdel="${i}" ${p.gallery.length < 2 ? 'disabled' : ''}>✕</button>
          </td></tr>`).join('')}
      </table>
      <h2 style="margin-top:18px">Add a photo</h2>
      <div class="adm-pool">${pool.slice(0, 24).map(src => `
        <button type="button" data-gadd="${esc(src)}"><img src="${esc(src)}" alt="" loading="lazy"></button>`).join('')}</div>
      <div style="display:flex;gap:8px;margin-top:12px">
        <input id="gPath" placeholder="/images/…  (any path under public/, incl. uploads)" style="flex:1;min-width:0">
        <button class="btn btn--sm" id="gAddPath">Add by path</button>
      </div></div>

    <div class="adm-card"><h2>Sizes & options</h2>
      <p class="adm-note" style="margin:0 0 12px"><b>Option labels are pricing keys.</b> If an edited label no longer matches the price matrix, the product shows "From price · confirmed on order" instead of a computed price — honest, but check the product page after editing. Values are comma-separated.</p>
      <div id="optRows">${p.options.map((o, i) => `
        <div style="display:flex;gap:8px;margin-bottom:8px" data-oi="${i}">
          <input data-ok value="${esc(o.k)}" placeholder="Option name" style="width:170px">
          <input data-ov value="${esc(o.v.join(', '))}" placeholder="Value, value, value" style="flex:1;min-width:0">
          <button class="btn btn--sm btn--danger" data-odel="${i}">✕</button>
        </div>`).join('')}</div>
      <div style="display:flex;gap:8px">
        <button class="btn btn--sm" id="optAdd">Add option set</button>
        <button class="btn btn--sm" id="optSave">Save options (draft)</button>
      </div></div>

    <div class="adm-card"><h2>“You may also like” (pairs)</h2>
      <p class="adm-note" style="margin:0 0 12px">Shown on the product page and driving the cart/checkout recommendations.</p>
      <div style="display:flex;gap:10px;flex-wrap:wrap">${CATALOGUE.filter(x => x.id !== id).map(x => `
        <label style="display:flex;gap:8px;align-items:center;font-size:13.5px;padding:7px 14px;border-radius:999px;background:rgba(255,255,255,.7)">
          <input type="checkbox" data-pair="${esc(x.id)}" ${p.pairs.includes(x.id) ? 'checked' : ''}> ${esc(x.t)}
        </label>`).join('')}</div></div>`

  const patchField = (f, v) => guard(() => {
    GM.products.update(id, { [f]: v })
    if (f === 'from') $('#usdPrev').value = zar(GM.products.get(id).from)
    toast(`${f} saved (draft)`)
    paintNav()
  })
  view.addEventListener('change', (e) => {
    const f = e.target.closest('[data-f]')
    if (f) { patchField(f.dataset.f, f.value); return }
    if (e.target.closest('[data-pair]')) {
      const pairs = Array.from(view.querySelectorAll('[data-pair]:checked')).map(c => c.dataset.pair)
      guard(() => { GM.products.update(id, { pairs }); toast('pairs saved (draft)'); paintNav() })
    }
  })
  const readOptions = () => Array.from(view.querySelectorAll('#optRows > div')).map(row => ({
    k: row.querySelector('[data-ok]').value,
    v: row.querySelector('[data-ov]').value.split(',').map(s => s.trim()).filter(Boolean),
  }))
  view.addEventListener('click', (e) => {
    const gmv = e.target.closest('[data-gmove]')
    if (gmv) {
      const g = [...GM.products.get(id).gallery]
      const i = Number(gmv.dataset.gi), j = i + Number(gmv.dataset.gmove)
      ;[g[i], g[j]] = [g[j], g[i]]
      guard(() => { GM.products.update(id, { gallery: g }); render() })
      return
    }
    const gdel = e.target.closest('[data-gdel]')
    if (gdel) {
      const g = GM.products.get(id).gallery.filter((_, i) => i !== Number(gdel.dataset.gdel))
      guard(() => { GM.products.update(id, { gallery: g }); render() })
      return
    }
    const gadd = e.target.closest('[data-gadd]')
    if (gadd) {
      guard(() => { GM.products.update(id, { gallery: [...GM.products.get(id).gallery, gadd.dataset.gadd] }); render() })
      return
    }
    if (e.target.closest('#gAddPath')) {
      const v = $('#gPath').value.trim()
      if (!v.startsWith('/')) return toast('paths start with /', true)
      guard(() => { GM.products.update(id, { gallery: [...GM.products.get(id).gallery, v] }); render() })
      return
    }
    if (e.target.closest('#optAdd')) {
      const div = document.createElement('div')
      div.style.cssText = 'display:flex;gap:8px;margin-bottom:8px'
      div.innerHTML = `<input data-ok placeholder="Option name" style="width:170px">
        <input data-ov placeholder="Value, value, value" style="flex:1;min-width:0">
        <button class="btn btn--sm btn--danger" data-odel>✕</button>`
      $('#optRows').appendChild(div)
      return
    }
    const odel = e.target.closest('[data-odel]')
    if (odel) { odel.parentElement.remove(); return }
    if (e.target.closest('#optSave')) {
      guard(() => { GM.products.update(id, { options: readOptions() }); toast('options saved (draft) — check the product page'); render() })
      return
    }
    if (e.target.closest('#pdToggle')) {
      guard(() => { p.hidden ? GM.products.show(id) : GM.products.hide(id); render() })
      return
    }
    if (e.target.closest('#pdReset')) {
      if (confirm('Reset every override on this product back to factory values?')) {
        guard(() => { GM.products.resetOverrides(id); toast('reset to factory values'); render() })
      }
    }
  })
}

/* ── boot ─────────────────────────────────────────────────────── */
function render () {
  const raw = location.hash.replace(/^#\//, '') || 'dashboard'
  const id = raw
  const section = raw.startsWith('product/')
    ? () => productDetail(raw.slice('product/'.length))
    : (SECTIONS[id] || SECTIONS.dashboard)
  // fresh node every render — section listeners die with the old one,
  // so handlers never accumulate or leak across sections
  const fresh = view.cloneNode(false)
  view.replaceWith(fresh)
  view = fresh
  section()
  paintNav()
  window.scrollTo(0, 0)
}

await ensureAuth()
$('#adm').hidden = false
store.onChange(paintNav)
addEventListener('hashchange', render)
render()
