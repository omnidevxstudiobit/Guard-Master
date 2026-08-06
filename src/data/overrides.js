/* Admin data layer. The storefront is static; the store owner manages it
   from /admin/, which writes drafts to localStorage and publishes by
   committing /admin-data.json to the repo (Vercel redeploys). This module
   loads published data + local drafts ONCE, before any page module runs —
   top-level await means every importer sees the merged result synchronously.

   Merge order: code defaults ← published admin-data.json ← local drafts.
   Drafts only exist in the owner's browser, so visitors always see the
   published state; the owner sees a live preview (flagged by a ribbon). */

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)

/* objects deep-merge; arrays and scalars replace */
export const merge = (base, extra) => {
  if (!isObj(base) || !isObj(extra)) return extra === undefined ? base : extra
  const out = { ...base }
  for (const k of Object.keys(extra)) out[k] = merge(base[k], extra[k])
  return out
}

let published = {}
try {
  // hard 3s ceiling — this await gates every page module, so a stalled
  // response must abort into the catch, never strand the curtain
  const r = await fetch('/admin-data.json', { cache: 'no-store', signal: AbortSignal.timeout?.(3000) })
  if (r.ok) published = await r.json()
} catch { /* offline, missing or slow — the base catalogue still works */ }
if (!isObj(published)) published = {}

let drafts = {}
try { drafts = JSON.parse(localStorage.getItem('gm_admin_drafts') || '{}') } catch {}
if (!isObj(drafts)) drafts = {}

export const OV = merge(published, drafts)
export const SETTINGS = isObj(OV.settings) ? OV.settings : {}
export const hasDrafts = Object.keys(drafts).length > 0
/* raw published state, pre-drafts — /admin/ diffs against this */
export const PUBLISHED = published

/* ── order log — checkout writes, /admin/ reads. localStorage because an
      order must outlive the browsing session the cart lives in. ──────── */
const ORDERS_KEY = 'gm_orders'
export const orderLog = {
  read () {
    try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') } catch { return [] }
  },
  add (order) {
    const all = orderLog.read()
    all.unshift(order)
    try { localStorage.setItem(ORDERS_KEY, JSON.stringify(all.slice(0, 200))) } catch {}
  },
  update (ref, patch) {
    const all = orderLog.read()
    const o = all.find(x => x.ref === ref)
    if (!o) return null
    Object.assign(o, patch)
    try { localStorage.setItem(ORDERS_KEY, JSON.stringify(all)) } catch {}
    return o
  },
}

/* ── webhooks — subscriptions live in admin data; events fire from the
      browser as JSON POSTs, best-effort (a dead endpoint must never
      break the storefront). Deliveries are logged for the admin UI. ─── */
export function fireWebhooks (topic, payload) {
  const subs = (Array.isArray(OV.webhooks) ? OV.webhooks : [])
    .filter(w => w && w.url && (w.topic === topic || w.topic === '*'))
  const body = JSON.stringify({ topic, firedAt: new Date().toISOString(), data: payload })
  subs.forEach(w => {
    fetch(w.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-GM-Topic': topic },
      body,
      // an orders/create POST may be the only owner-visible record of a
      // real customer's order — it must survive the confirmation-page
      // navigation that usually follows immediately
      keepalive: true,
    }).then(r => logDelivery(topic, w.url, r.ok ? 'ok' : 'http ' + r.status))
      .catch(() => logDelivery(topic, w.url, 'unreachable'))
  })
  return subs.length
}
function logDelivery (topic, url, result) {
  try {
    const log = JSON.parse(localStorage.getItem('gm_webhook_log') || '[]')
    log.unshift({ topic, url, result, at: new Date().toISOString() })
    localStorage.setItem('gm_webhook_log', JSON.stringify(log.slice(0, 50)))
  } catch {}
}
