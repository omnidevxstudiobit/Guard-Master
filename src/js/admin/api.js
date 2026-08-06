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
    hidden: !!o.hidden,
  }
}

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
  /* patch: {t, d, plain, spec, from (ZAR), lead, hidden} — empty string clears an override */
  update (id, patch) {
    if (!CATALOGUE.find(p => p.id === id)) throw new Error('unknown product: ' + id)
    const cur = store.get('products.' + id, null) || {}
    const next = { ...cur }
    for (const k of ['t', 'd', 'plain', 'spec', 'lead']) {
      if (!(k in patch)) continue
      const v = String(patch[k] ?? '').trim()
      if (v) next[k] = v; else delete next[k]
    }
    if ('from' in patch) {
      const n = Number(patch.from)
      if (n > 0) next.from = n; else delete next.from
    }
    if ('hidden' in patch) { patch.hidden ? next.hidden = true : delete next.hidden }
    if ('gallery' in patch) {
      const g = (patch.gallery || []).filter(s => typeof s === 'string' && s.startsWith('/'))
      const base = CATALOGUE.find(p => p.id === id).gallery
      if (g.length && JSON.stringify(g) !== JSON.stringify(base)) next.gallery = g
      else delete next.gallery
    }
    if ('pairs' in patch) {
      const ids = (patch.pairs || []).filter(pid => CATALOGUE.find(p => p.id === pid) && pid !== id)
      const base = CATALOGUE.find(p => p.id === id).pairs || []
      if (JSON.stringify(ids) !== JSON.stringify(base)) next.pairs = ids
      else delete next.pairs
    }
    if ('options' in patch) {
      const os = (patch.options || [])
        .map(o => ({ k: String(o.k || '').trim(), v: (o.v || []).map(v => String(v).trim()).filter(Boolean), ...(o.note ? { note: o.note } : {}) }))
        .filter(o => o.k && o.v.length)
      const base = CATALOGUE.find(p => p.id === id).options
      if (JSON.stringify(os) !== JSON.stringify(base)) next.options = os
      else delete next.options
    }
    store.set('products.' + id, Object.keys(next).length ? next : null)
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
  list: () => BASE_CATEGORIES.map(c => ({ ...c, ...(store.get('collections.' + c.id, null) || {}) })),
  get: (id) => collections.list().find(c => c.id === id) || null,
  update (id, patch) {
    if (!BASE_CATEGORIES.find(c => c.id === id)) throw new Error('unknown collection: ' + id)
    const cur = store.get('collections.' + id, null) || {}
    const next = { ...cur }
    for (const k of ['name', 'lede', 'blurb']) {
      if (!(k in patch)) continue
      const v = String(patch[k] ?? '').trim()
      if (v) next[k] = v; else delete next[k]
    }
    if ('products' in patch) {
      const ids = (patch.products || []).filter(pid => CATALOGUE.find(p => p.id === pid))
      if (ids.length) next.products = ids; else delete next.products
    }
    store.set('collections.' + id, Object.keys(next).length ? next : null)
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

/* ══ Discounts & gift codes ════════════════════════════════════ */
const allDiscounts = () => { const d = store.get('discounts', []); return Array.isArray(d) ? d : [] }
export const discounts = {
  list: allDiscounts,
  /* kind: 'percent' (value = %) or 'amount' (value = ZAR) */
  create ({ code, kind = 'percent', value, active = true, giftcard = false }) {
    code = String(code || '').trim().toUpperCase()
    if (!code) throw new Error('a code is required')
    if (!['percent', 'amount'].includes(kind)) throw new Error("kind must be 'percent' or 'amount'")
    if (allDiscounts().find(d => d.code === code)) throw new Error('code already exists: ' + code)
    const v = Number(value)
    if (!(v > 0) || (kind === 'percent' && v > 100)) throw new Error('bad value')
    const list = [...allDiscounts(), { code, kind, value: v, active, giftcard, createdAt: now() }]
    store.set('discounts', list)
    return list[list.length - 1]
  },
  update (code, patch) {
    const list = allDiscounts().map(d => d.code === code ? { ...d, ...patch, code: d.code } : d)
    store.set('discounts', list)
    return list.find(d => d.code === code)
  },
  remove (code) { store.set('discounts', allDiscounts().filter(d => d.code !== code)) },
}
export const giftCards = {
  issue (amountZar) {
    for (let tries = 0; tries < 5; tries++) {
      const code = 'GM-GIFT-' + Math.random().toString(36).slice(2, 6).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase()
      if (!allDiscounts().find(d => d.code === code)) {
        return discounts.create({ code, kind: 'amount', value: amountZar, giftcard: true })
      }
    }
    throw new Error('could not generate a unique code — try again')
  },
  list: () => allDiscounts().filter(d => d.giftcard),
  redeemManually: (code) => discounts.update(code, { active: false, redeemedAt: now() }),
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
