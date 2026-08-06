/* The Guard Master API surface. Every namespace is a real, callable
   client-side API over the admin data layer: reads see published data +
   drafts, writes land in drafts until Publish commits them. The admin
   sections are built ON these APIs (they are load-bearing, not
   decorative), and the whole object is exposed as window.GM in the
   admin API console.

   Reality notes, stated rather than hidden:
   - There is no server. Orders/customers come from this browser's
     order log; webhooks fire from the browser; auth protects the UI
     while the GitHub token is the actual security boundary.
   - Inventory is deliberately not stock-counted (site rule: no
     invented stock). It carries honest lead-time notes instead. */

import { CATALOGUE, PRODUCTS, ZAR_PER_USD } from '../../data/products.js'
import { BASE_CATEGORIES } from '../../data/categories.js'
import { orderLog, fireWebhooks } from '../../data/overrides.js'
import * as store from './store.js'

const now = () => new Date().toISOString()
const slug = (s) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/* merged product view for one id (override on top of factory base) */
const mergedProduct = (p) => {
  const o = store.get('products.' + p.id, null) || {}
  return {
    ...p,
    ...['t', 'd', 'plain', 'spec', 'lead'].reduce((a, k) => (typeof o[k] === 'string' && o[k].trim() ? (a[k] = o[k], a) : a), {}),
    from: Number(o.from) > 0 ? Number(o.from) : p.from,
    gallery: (Array.isArray(o.gallery) && o.gallery.length) ? o.gallery : p.gallery,
    pairs: Array.isArray(o.pairs) ? o.pairs : p.pairs,
    options: Array.isArray(o.options) ? o.options : p.options,
    g: GROUPS.includes(o.g) ? o.g : p.g,
    tags: Array.isArray(o.tags) ? o.tags : (p.tags || []),
    hidden: !!o.hidden,
  }
}

/* product types — the catalogue's three groups, used by filters */
export const GROUPS = ['clearview', 'razor', 'access']

/* ══ Storefront-facing reads ═══════════════════════════════════ */
export const storefront = {
  /* what a visitor sees right now (drafts included in this browser) */
  products: () => PRODUCTS.map(p => ({ ...p })),
  product: (id) => PRODUCTS.find(p => p.id === id) || null,
  rate: () => ZAR_PER_USD,
}

export const products = {
  list: ({ includeHidden = true } = {}) =>
    CATALOGUE.map(mergedProduct).filter(p => includeHidden || !p.hidden),
  get: (id) => { const p = CATALOGUE.find(x => x.id === id); return p ? mergedProduct(p) : null },
  /* patch: {t, d, plain, spec, from (ZAR), lead, hidden, gallery, pairs,
     options, g, tags} — empty/base-equal values clear the override */
  update (id, patch) {
    const base = CATALOGUE.find(p => p.id === id)
    if (!base) throw new Error('unknown product: ' + id)
    const cur = store.get('products.' + id, null) || {}
    const next = { ...cur }
    /* cleared fields are stored as explicit null, NEVER deleted — a
       missing draft key lets the published admin-data.json value
       re-merge over the clear (adversarial review BLOCKER; same trap
       the email field documents). null replaces in merge(), every
       consumer treats it as no-override, prune() strips it at publish. */
    for (const k of ['t', 'd', 'plain', 'spec', 'lead']) {
      if (!(k in patch)) continue
      const v = String(patch[k] ?? '').trim()
      next[k] = (v && v !== String(base[k] ?? '')) ? v : null
    }
    if ('from' in patch) {
      const n = Number(patch.from)
      next.from = (n > 0 && n !== base.from) ? n : null
    }
    if ('g' in patch) {
      next.g = (GROUPS.includes(patch.g) && patch.g !== base.g) ? patch.g : null
    }
    if ('tags' in patch) {
      const ts = (patch.tags || []).map(t => String(t).trim()).filter(Boolean)
      next.tags = JSON.stringify(ts) !== JSON.stringify(base.tags || []) ? ts : null
    }
    if ('hidden' in patch) { next.hidden = patch.hidden ? true : null }
    if ('gallery' in patch) {
      const g = (patch.gallery || []).filter(s => typeof s === 'string' && s.startsWith('/'))
      next.gallery = (g.length && JSON.stringify(g) !== JSON.stringify(base.gallery)) ? g : null
    }
    if ('pairs' in patch) {
      const ids = (patch.pairs || []).filter(pid => CATALOGUE.find(p => p.id === pid) && pid !== id)
      next.pairs = JSON.stringify(ids) !== JSON.stringify(base.pairs || []) ? ids : null
    }
    if ('options' in patch) {
      const os = (patch.options || [])
        .map(o => ({ k: String(o.k || '').trim(), v: (o.v || []).map(v => String(v).trim()).filter(Boolean), ...(o.note ? { note: o.note } : {}) }))
        .filter(o => o.k && o.v.length)
      next.options = JSON.stringify(os) !== JSON.stringify(base.options) ? os : null
    }
    const allNull = Object.values(next).every(v => v === null)
    store.set('products.' + id, allNull ? null : next)
    return products.get(id)
  },
  hide: (id) => products.update(id, { hidden: true }),
  show: (id) => products.update(id, { hidden: false }),
  resetOverrides: (id) => { store.set('products.' + id, null); return products.get(id) },
  /* who comes first — full id ordering for the home grid + catalogue deck */
  order: () => {
    const ord = store.get('settings.productOrder', null)
    const ranked = Array.isArray(ord) ? ord.filter(id => CATALOGUE.find(p => p.id === id)) : []
    const rest = CATALOGUE.map(p => p.id).filter(id => !ranked.includes(id))
    return [...ranked, ...rest]
  },
  reorder (ids) {
    const clean = (ids || []).filter(id => CATALOGUE.find(p => p.id === id))
    store.set('settings.productOrder', clean.length ? clean : null)
    return products.order()
  },
  bestSellers: () => {
    const b = store.get('settings.bestSellers', null)
    return Array.isArray(b) && b.length ? b : ['panels', 'posts', 'caps', 'coils', 'spikes', 'gates', 'razormesh', 'clamps']
  },
  setBestSellers (ids) {
    const clean = (ids || []).filter(id => CATALOGUE.find(p => p.id === id))
    store.set('settings.bestSellers', clean.length ? clean : null)
    return products.bestSellers()
  },
}

export const collections = {
  /* null override slots mean "cleared" — filter them before spreading */
  list: () => BASE_CATEGORIES.map(c => {
    const o = store.get('collections.' + c.id, null)
    const clean = {}
    for (const [k, v] of Object.entries(o || {})) if (v !== null && v !== undefined) clean[k] = v
    return { ...c, ...clean }
  }),
  get: (id) => collections.list().find(c => c.id === id) || null,
  update (id, patch) {
    const base = BASE_CATEGORIES.find(c => c.id === id)
    if (!base) throw new Error('unknown collection: ' + id)
    const cur = store.get('collections.' + id, null) || {}
    const next = { ...cur }
    /* explicit null, never delete — see products.update */
    for (const k of ['name', 'lede', 'blurb']) {
      if (!(k in patch)) continue
      const v = String(patch[k] ?? '').trim()
      next[k] = v || null
    }
    if ('products' in patch) {
      const ids = (patch.products || []).filter(pid => CATALOGUE.find(p => p.id === pid))
      /* an empty list is a real state (owner emptied the page) and must
         be representable — only base-equal lists clear the override */
      next.products = JSON.stringify(ids) !== JSON.stringify(base.products || []) ? ids : null
    }
    const allNull = Object.values(next).every(v => v === null)
    store.set('collections.' + id, allNull ? null : next)
    return collections.get(id)
  },
}

export const search = {
  query: (q) => {
    const s = String(q || '').toLowerCase()
    return products.list({ includeHidden: false })
      .filter(p => (p.t + ' ' + p.d + ' ' + p.plain + ' ' + (p.tags || []).join(' ')).toLowerCase().includes(s))
  },
}

export const productRecommendations = {
  forProduct: (id) => (products.get(id)?.pairs || []).map(products.get).filter(Boolean),
  forOrder: (lines) => {
    const have = new Set(lines.map(l => l.id))
    const want = []
    lines.forEach(l => (products.get(l.id)?.pairs || []).forEach(pid => {
      if (!have.has(pid) && !want.includes(pid)) want.push(pid)
    }))
    return want.map(products.get).filter(Boolean)
  },
}

/* ══ Cart & checkout ═══════════════════════════════════════════ */
export const cart = {
  read () { try { return JSON.parse(sessionStorage.getItem('gm_cart_lines') || '[]') } catch { return [] } },
  count: () => cart.read().reduce((s, l) => s + l.qty, 0),
  clear () { sessionStorage.setItem('gm_cart_lines', '[]'); sessionStorage.setItem('gm_cart_count', '0') },
}

export const checkout = {
  settings: () => ({ delivery: true, collection: true, note: '', ...(store.get('settings.checkout', null) || {}) }),
  update (patch) {
    const next = { ...checkout.settings(), ...patch }
    if (next.delivery === false && next.collection === false) throw new Error('at least one fulfilment option must stay on')
    store.set('settings.checkout', next)
    return next
  },
}

/* ══ Orders, customers, fulfilment — from this browser's log ═══ */
export const orders = {
  list: () => orderLog.read(),
  get: (ref) => orderLog.read().find(o => o.ref === ref) || null,
  updateStatus (ref, status) {
    const o = orderLog.update(ref, { status, statusAt: now() })
    if (o && (status === 'fulfilled' || status === 'collected')) fireWebhooks('orders/fulfilled', o)
    return o
  },
  addNote: (ref, note) => orderLog.update(ref, { adminNote: note }),
}

export const fulfillment = {
  fulfill: (ref) => orders.updateStatus(ref, 'fulfilled'),
  collect: (ref) => orders.updateStatus(ref, 'collected'),
  cancel: (ref) => orders.updateStatus(ref, 'cancelled'),
}

export const customerProfile = {
  list () {
    const by = {}
    for (const o of orderLog.read()) {
      const email = o.customer?.email
      if (!email) continue
      by[email] ||= { email, name: o.customer.name, phone: o.customer.phone, company: o.customer.company, orders: 0, totalZar: 0 }
      by[email].orders++
      by[email].totalZar += o.total ?? o.goods ?? 0
    }
    return Object.values(by)
  },
  get: (email) => customerProfile.list().find(c => c.email === email) || null,
}
export const customerAddress = {
  forCustomer: (email) => orderLog.read()
    .filter(o => o.customer?.email === email && o.customer.address)
    .map(o => o.customer.address),
}
export const customerOrders = {
  forCustomer: (email) => orderLog.read().filter(o => o.customer?.email === email),
}
export const customerAuthentication = {
  /* no accounts backend — a customer proves an order with ref + email */
  lookup: (ref, email) => {
    const o = orders.get(ref)
    return o && o.customer?.email?.toLowerCase() === String(email).toLowerCase() ? o : null
  },
}
export const customerAccount = {
  summary: (email) => {
    const p = customerProfile.get(email)
    return p ? { ...p, addresses: customerAddress.forCustomer(email), history: customerOrders.forCustomer(email) } : null
  },
}

/* ══ Inventory — honest lead times, never invented stock ═══════ */
export const inventory = {
  get: (id) => { const p = products.get(id); return p ? { id, tracked: false, lead: p.lead || null } : null },
  setLead: (id, text) => products.update(id, { lead: text }),
  policy: () => 'Stock is confirmed by the factory on order — the site never claims counts it cannot know.',
}

/* ══ Discounts & gift cards — Shopify's shape, the honest subset.
      Minimum purchase and active dates ARE enforced (checkout checks
      them against published data); usage limits are NOT offered —
      counting uses across shoppers needs a backend, and a limit the
      store can't enforce would be a lie. ══════════════════════════ */
const allDiscounts = () => { const d = store.get('discounts', []); return Array.isArray(d) ? d : [] }
/* date windows are pinned to STORE time (SAST, UTC+2) — the owner is in
   SA, shoppers are in the US, and both must agree on when a code lives */
export const dayStart = (s) => { const d = new Date(s + 'T00:00:00+02:00'); return isNaN(d) ? null : d }
export const dayEnd = (s) => { const d = new Date(s + 'T23:59:59.999+02:00'); return isNaN(d) ? null : d }
const DATE_RX = /^\d{4}-\d{2}-\d{2}$/
export const discounts = {
  list: allDiscounts,
  /* kind: 'percent' (value = %) or 'amount' (value = ZAR); optional
     minZar minimum purchase and startsAt/endsAt (yyyy-mm-dd) window */
  create ({ code, kind = 'percent', value, active = true, giftcard = false, minZar = null, startsAt = null, endsAt = null, for: holder = '' }) {
    code = String(code || '').trim().toUpperCase()
    if (!code) throw new Error('a code is required')
    if (!['percent', 'amount'].includes(kind)) throw new Error("kind must be 'percent' or 'amount'")
    if (allDiscounts().find(d => d.code === code)) throw new Error('code already exists: ' + code)
    const v = Number(value)
    if (!(v > 0) || (kind === 'percent' && v > 100)) throw new Error('bad value')
    const entry = { code, kind, value: v, active, giftcard, createdAt: now() }
    if (minZar !== null && minZar !== '') {
      const m = Number(minZar)
      if (!(m > 0)) throw new Error('the minimum must be a positive ZAR amount')
      entry.minZar = m
    }
    for (const [k, s] of [['startsAt', startsAt], ['endsAt', endsAt]]) {
      if (!s) continue
      if (!DATE_RX.test(s) || !dayStart(s)) throw new Error(`bad ${k === 'startsAt' ? 'start' : 'end'} date`)
      entry[k] = s
    }
    if (entry.startsAt && entry.endsAt && dayEnd(entry.endsAt) < dayStart(entry.startsAt)) {
      throw new Error('the end date is before the start date')
    }
    if (holder) entry.for = String(holder).trim()
    store.set('discounts', [...allDiscounts(), entry])
    return entry
  },
  /* patches go through the same validators as create — the API console
     is one typo away from silently mutating a live code otherwise */
  update (code, patch) {
    const cur = allDiscounts().find(d => d.code === code)
    if (!cur) throw new Error('unknown code: ' + code)
    const p = { ...patch }
    if ('kind' in p && !['percent', 'amount'].includes(p.kind)) throw new Error("kind must be 'percent' or 'amount'")
    if ('value' in p) {
      const v = Number(p.value)
      if (!(v > 0) || ((p.kind ?? cur.kind) === 'percent' && v > 100)) throw new Error('bad value')
      p.value = v
    }
    if ('minZar' in p && p.minZar !== null) {
      const m = Number(p.minZar)
      if (!(m > 0)) throw new Error('the minimum must be a positive ZAR amount')
      p.minZar = m
    }
    for (const k of ['startsAt', 'endsAt']) {
      if (k in p && p[k] !== null && (!DATE_RX.test(p[k]) || !dayStart(p[k]))) throw new Error('bad ' + k)
    }
    const list = allDiscounts().map(d => d.code === code ? { ...d, ...p, code: d.code } : d)
    store.set('discounts', list)
    return list.find(d => d.code === code)
  },
  remove (code) { store.set('discounts', allDiscounts().filter(d => d.code !== code)) },
  /* derived, Shopify-style. Invalid stored dates fail OPEN (active) on
     both sides — the admin must never report a code dead while the
     checkout keeps taking it (adversarial finding: `at > null` is true) */
  status (d, at = new Date()) {
    if (d.redeemedAt) return 'redeemed'
    if (d.active === false) return 'off'
    const s = d.startsAt ? dayStart(d.startsAt) : null
    if (s && at < s) return 'scheduled'
    const e = d.endsAt ? dayEnd(d.endsAt) : null
    if (e && at > e) return 'expired'
    return 'active'
  },
  /* honest label: counts orders recorded in THIS browser only */
  usedCount: (code) => orderLog.read().filter(o => o.discount?.code === code).length,
}
export const giftCards = {
  issue (amountZar, { for: holder = '', endsAt = null } = {}) {
    for (let tries = 0; tries < 5; tries++) {
      const code = 'GM-GIFT-' + Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase()
      if (!allDiscounts().find(d => d.code === code)) {
        return discounts.create({ code, kind: 'amount', value: amountZar, giftcard: true, for: holder, endsAt })
      }
    }
    throw new Error('could not generate a unique code — try again')
  },
  list: () => allDiscounts().filter(d => d.giftcard),
  /* the list shows last-4 only, like Shopify; the full code is revealed
     once at issue time (and via explicit copy — the owner has to send
     it to the recipient somehow) */
  mask: (code) => '•••• ' + String(code).slice(-4),
  redeemManually: (code) => discounts.update(code, { active: false, redeemedAt: now() }),
  deactivate: (code) => discounts.update(code, { active: false }),
}

/* ══ Draft orders — compose, then open in the real checkout ════ */
export const draftOrders = {
  list: () => { const d = store.get('draftOrders', []); return Array.isArray(d) ? d : [] },
  create ({ lines, note = '' }) {
    if (!Array.isArray(lines) || !lines.length) throw new Error('lines required')
    const draft = { id: 'D-' + Date.now().toString(36).toUpperCase(), note, lines, createdAt: now() }
    store.set('draftOrders', [...draftOrders.list(), draft])
    return draft
  },
  remove: (id) => store.set('draftOrders', draftOrders.list().filter(d => d.id !== id)),
  openInCheckout (id) {
    const d = draftOrders.list().find(x => x.id === id)
    if (!d) throw new Error('unknown draft: ' + id)
    sessionStorage.setItem('gm_cart_lines', JSON.stringify(d.lines))
    sessionStorage.setItem('gm_cart_count', String(d.lines.reduce((s, l) => s + l.qty, 0)))
    location.href = '/checkout/'
  },
}

/* ══ Metafields — free key/values per product ══════════════════ */
export const metafields = {
  get: (id) => store.get('metafields.' + id, null) || {},
  set (id, key, value) {
    const cur = { ...metafields.get(id) }
    if (value === null || value === '') delete cur[key]
    else cur[key] = value
    store.set('metafields.' + id, Object.keys(cur).length ? cur : null)
    return cur
  },
}

/* ══ Files & media ═════════════════════════════════════════════ */
/* photos suitable for the homepage cover — the client's real shots */
export const PHOTO_POOL = [
  '/images/estate/dusk.jpg', '/images/estate/header.jpg',
  '/images/estate/landscape.jpg', '/images/estate/lifestyle.jpg',
  '/images/razor-wire-dusk.jpg',
  '/images/products/projects/dji-20240903-084123-886-1600.webp',
  '/images/products/clear-view-fencing-posts/dji-20250930-103035-128-1600.webp',
  '/images/products/clear-view-after-dark/clear-view-residential-frontage-dusk-1174.webp',
]
export const files = {
  /* queued uploads publish as commits to public/images/uploads/ */
  pending: () => { const f = store.drafts.__files; return Array.isArray(f) ? f.map(({ name, size }) => ({ name, size })) : [] },
  queue ({ name, b64, size }) {
    name = name.replace(/[^\w.\-]+/g, '-').toLowerCase()
    const list = Array.isArray(store.drafts.__files) ? store.drafts.__files : []
    store.drafts.__files = [...list.filter(f => f.name !== name), { name, b64, size }]
    store.save()
    return files.pending()
  },
  remove (name) {
    store.drafts.__files = (store.drafts.__files || []).filter(f => f.name !== name)
    store.save()
  },
}
export const media = {
  list: () => [...PHOTO_POOL, ...(store.get('media', []) || [])],
  videos: () => ['/video/factory.mp4', '/video/factory-2.mp4'],
}

/* ══ Pages & blog — owner-authored content on /pages/ ══════════ */
const allPages = () => { const p = store.get('pages', []); return Array.isArray(p) ? p : [] }
const upsertPage = (kind, { slug: s, title, body }) => {
  s = slug(s || title)
  if (!s || !title) throw new Error('slug and title required')
  const entry = { slug: s, kind, title, body: String(body || ''), updatedAt: now() }
  const list = allPages().filter(p => p.slug !== s)
  list.push(entry)
  store.set('pages', list)
  return { ...entry, url: '/pages/?s=' + s }
}
export const pages = {
  list: () => allPages().filter(p => p.kind !== 'post'),
  save: (p) => upsertPage('page', p),
  remove: (s) => store.set('pages', allPages().filter(p => p.slug !== s)),
}
export const blogs = {
  list: () => allPages().filter(p => p.kind === 'post'),
  save: (p) => upsertPage('post', p),
  remove: pages.remove,
}

/* ══ Store information ═════════════════════════════════════════ */
export const storeInformation = {
  get: () => ({
    promo: store.get('settings.promo', ''),
    hero: store.get('settings.hero', '/images/estate/dusk.jpg'),
    rateZarPerUsd: store.get('settings.rateZarPerUsd', ZAR_PER_USD),
    email: store.get('settings.store.email', 'info@fencing-supplier.com'),
  }),
  update (patch) {
    if ('promo' in patch) store.set('settings.promo', String(patch.promo || '').trim() || null)
    if ('hero' in patch) store.set('settings.hero', patch.hero || null)
    if ('rateZarPerUsd' in patch) {
      const n = Number(patch.rateZarPerUsd)
      store.set('settings.rateZarPerUsd', n > 0 ? n : null)
    }
    /* '' is stored explicitly — undefined would vanish in JSON and let the
       published email re-merge over the clear (adversarial review finding);
       the storefront treats a non-address as "use the default" */
    if ('email' in patch) store.set('settings.store', { ...(store.get('settings.store', null) || {}), email: String(patch.email || '').trim() })
    return storeInformation.get()
  },
}

/* ══ Locations — the two dot maps on /us/ ══════════════════════ */
export const locations = {
  get: (map) => store.get('locations.' + map + '.cities', null),
  setCities (map, cities) {
    if (!['sa', 'us'].includes(map)) throw new Error('map is sa or us')
    store.set('locations.' + map, cities && cities.length ? { cities } : null)
  },
  reset: (map) => locations.setCities(map, null),
}

/* ══ Webhooks ══════════════════════════════════════════════════ */
export const TOPICS = ['orders/create', 'orders/fulfilled', '*']
export const webhooks = {
  list: () => { const w = store.get('webhooks', []); return Array.isArray(w) ? w : [] },
  subscribe (topic, url) {
    if (!TOPICS.includes(topic)) throw new Error('topic must be one of ' + TOPICS.join(', '))
    try { new URL(url) } catch { throw new Error('that is not a URL') }
    store.set('webhooks', [...webhooks.list(), { topic, url, createdAt: now() }])
    return webhooks.list()
  },
  unsubscribe: (i) => store.set('webhooks', webhooks.list().filter((_, n) => n !== i)),
  deliveries: () => { try { return JSON.parse(localStorage.getItem('gm_webhook_log') || '[]') } catch { return [] } },
  /* fires a real POST at every matching subscription */
  test: (topic = 'orders/create') => fireWebhooks(topic, { test: true, ref: 'GM-TEST-0000', total: 0, firedFrom: '/admin/' }),
}

/* ══ Admin meta ════════════════════════════════════════════════ */
export const admin = {
  drafts: () => store.drafts,
  dirty: store.dirty,
  discard: store.discard,
  publishPayload: store.publishPayload,
}

export const GM = {
  storefront, admin, customerAccount, products, collections, search,
  productRecommendations, cart, checkout, customerAuthentication,
  customerProfile, customerAddress, customerOrders, inventory, orders,
  discounts, giftCards, draftOrders, metafields, files, media, blogs,
  pages, storeInformation, locations, fulfillment, webhooks,
}
