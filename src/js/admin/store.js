/* /admin/ draft store. Every edit lands in localStorage drafts first;
   the storefront (same browser) merges them for live preview. Publish
   flattens published + drafts and commits /public/admin-data.json to
   the GitHub repo, which redeploys the site — that commit is the real
   act of publishing, and the token that authorises it is the real
   security boundary of this admin. */

import { PUBLISHED, merge } from '../../data/overrides.js'

const KEY = 'gm_admin_drafts'
const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v)

export let drafts = {}
try { drafts = JSON.parse(localStorage.getItem(KEY) || '{}') } catch {}
if (!isObj(drafts)) drafts = {}

const listeners = []
export const onChange = (fn) => listeners.push(fn)

export function save () {
  try { localStorage.setItem(KEY, JSON.stringify(drafts)) } catch {}
  listeners.forEach(f => f())
}

/* the state the storefront preview sees */
export const view = () => merge(PUBLISHED, drafts)

/* dot-path helpers — segments never contain dots (ids are slugs) */
export function get (path, fallback) {
  let cur = view()
  for (const k of path.split('.')) {
    if (cur == null || typeof cur !== 'object') return fallback
    cur = cur[k]
  }
  return cur === undefined ? fallback : cur
}
export function set (path, value) {
  const keys = path.split('.')
  // no path segment may walk or write the prototype chain
  if (keys.some(k => ['__proto__', 'constructor', 'prototype'].includes(k))) {
    throw new Error('bad path segment')
  }
  let cur = drafts
  for (let i = 0; i < keys.length - 1; i++) {
    if (!Object.prototype.hasOwnProperty.call(cur, keys[i]) || !isObj(cur[keys[i]])) cur[keys[i]] = {}
    cur = cur[keys[i]]
  }
  cur[keys[keys.length - 1]] = value
  save()
}

export const dirty = () => Object.keys(drafts).length > 0
export function discard () {
  for (const k of Object.keys(drafts)) delete drafts[k]
  save()
}

/* strip null/undefined override slots before they land in the JSON */
function prune (v) {
  if (Array.isArray(v)) return v.map(prune)
  if (!isObj(v)) return v
  const out = {}
  for (const [k, val] of Object.entries(v)) {
    if (val === null || val === undefined) continue
    const p = prune(val)
    if (isObj(p) && !Object.keys(p).length && k !== 'settings') continue
    out[k] = p
  }
  return out
}

/* what a publish would write — also drives the diff screen */
export function publishPayload () {
  const data = prune(view())
  delete data.__files
  data.v = 1
  data.updatedAt = new Date().toISOString()
  return data
}

/* ── GitHub publish — commits the JSON (and any queued media files)
      to the repo; Vercel deploys from main. The token stays in this
      browser only. ─────────────────────────────────────────────── */
const GH_KEY = 'gm_admin_gh'
export const ghConfig = {
  read () {
    try { return { owner: 'siraajul', repo: 'Guard-Master', branch: 'main', token: '', ...JSON.parse(localStorage.getItem(GH_KEY) || '{}') } }
    catch { return { owner: 'siraajul', repo: 'Guard-Master', branch: 'main', token: '' } }
  },
  write (cfg) { try { localStorage.setItem(GH_KEY, JSON.stringify(cfg)) } catch {} },
}

const b64utf8 = (s) => btoa(unescape(encodeURIComponent(s)))

async function ghPut (cfg, path, contentB64, message) {
  const base = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`
  const headers = {
    Authorization: 'Bearer ' + cfg.token,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
  }
  let sha
  const probe = await fetch(`${base}?ref=${cfg.branch}`, { headers })
  if (probe.ok) sha = (await probe.json()).sha
  else if (probe.status !== 404) throw new Error(`GitHub read failed (${probe.status}) for ${path}`)
  const put = await fetch(base, {
    method: 'PUT', headers,
    body: JSON.stringify({ message, content: contentB64, branch: cfg.branch, ...(sha ? { sha } : {}) }),
  })
  if (!put.ok) throw new Error(`GitHub write failed (${put.status}) for ${path}: ${(await put.text()).slice(0, 200)}`)
  return put.json()
}

export async function publish (cfg, log = () => {}) {
  if (!cfg.token) throw new Error('A GitHub token is needed to publish.')
  const files = Array.isArray(drafts.__files) ? drafts.__files : []
  const uploaded = []
  for (const f of files) {
    log(`Uploading ${f.name}…`)
    const path = `public/images/uploads/${f.name}`
    await ghPut(cfg, path, f.b64, `admin: upload ${f.name}`)
    uploaded.push('/images/uploads/' + f.name)
  }
  const data = publishPayload()
  data.media = [...new Set([...(data.media || []), ...uploaded])]
  log('Committing admin-data.json…')
  await ghPut(cfg, 'public/admin-data.json', b64utf8(JSON.stringify(data, null, 2) + '\n'),
    'admin: publish storefront changes')
  discard()
  log('Published. Vercel is deploying — live in about a minute.')
  return data
}

/* fallback when there is no token: download the JSON to commit by hand */
export function exportJSON () {
  const blob = new Blob([JSON.stringify(publishPayload(), null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'admin-data.json'
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 4000)
}
