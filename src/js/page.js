/* /pages/ — renders owner-authored content from the admin data layer.
   ?s=<slug> shows one page or post; without a slug it lists everything
   published (posts first). Bodies are plain text: blank lines split
   paragraphs, and everything is escaped — the owner writes copy here,
   not markup. */

import { initCart } from './app.js'
import { OV } from '../data/overrides.js'

const $ = s => document.querySelector(s)
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))
const paras = (body) => esc(body).split(/\n\s*\n/).filter(Boolean)
  .map(p => `<p style="margin:0 0 1.2em">${p.replace(/\n/g, '<br>')}</p>`).join('')

/* admin-data.json is hand-committable — a stray null or malformed entry
   must not kill the page */
const all = (Array.isArray(OV.pages) ? OV.pages : [])
  .filter(p => p && typeof p.slug === 'string' && typeof p.title === 'string')
const slug = new URLSearchParams(location.search).get('s')
const page = slug ? all.find(p => p.slug === slug) : null

if (page) {
  document.title = `${page.title} — Guard Master`
  $('#pgKicker').textContent = page.kind === 'post' ? 'From the blog' : 'Guard Master'
  $('#pgTitle').textContent = page.title
  $('#pgContent').innerHTML = paras(page.body) +
    `<p style="font-family:var(--mono);font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-top:34px">Updated ${new Date(page.updatedAt).toLocaleDateString()}</p>`
} else {
  document.title = 'Pages — Guard Master'
  $('#pgTitle').textContent = slug ? 'Page not found' : 'Pages & posts'
  const posts = all.filter(p => p.kind === 'post')
  const rest = all.filter(p => p.kind !== 'post')
  const li = (p) => `<p style="margin:0 0 10px"><a href="/pages/?s=${esc(p.slug)}" style="color:var(--ink);font-weight:700">${esc(p.title)}</a>
    <span style="color:var(--muted);font-size:13px"> — ${p.kind === 'post' ? 'post' : 'page'}, ${new Date(p.updatedAt).toLocaleDateString()}</span></p>`
  $('#pgContent').innerHTML = all.length
    ? (posts.length ? `<h2 style="font-size:18px;margin:0 0 12px">Posts</h2>${posts.map(li).join('')}` : '') +
      (rest.length ? `<h2 style="font-size:18px;margin:24px 0 12px">Pages</h2>${rest.map(li).join('')}` : '')
    : '<p>Nothing published here yet.</p>'
}

initCart()
