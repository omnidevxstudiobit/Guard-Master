import { initCart, initHero, cartStore } from './app.js'
import { PRODUCTS, byId, zar } from '../data/products.js'

const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches
const $ = s => document.querySelector(s)

const deck = $('#deck')
const dots = $('#dots')
const linesEl = $('#lines')

let frames = []     // every image of every product in the order
let top = 0
let cards = []
let auto = null

const AUTO_MS = 3200

/* ── frames come from the order, not the whole catalogue ──────── */
function buildFrames () {
  const order = cartStore.read()
  frames = []
  order.forEach(l => {
    // configured lines carry an `id` back to the catalogue entry
    const prod = byId(l.id) || PRODUCTS.find(p => p.t === l.t)
    const imgs = prod?.gallery?.length ? prod.gallery : [l.img].filter(Boolean)
    imgs.forEach(src => frames.push({ src, title: l.t, spec: l.spec || prod?.spec || '', price: zar(l.unit) }))
  })
}

function renderDeck () {
  deck.innerHTML = frames.map((f, i) => `
    <article class="deck-card" data-i="${i}">
      <span class="badge">${f.price}</span>
      <img src="${f.src}" alt="${f.title}" draggable="false" loading="${i < 3 ? 'eager' : 'lazy'}">
      <div class="meta"><b>${f.title}</b><span>${f.spec}</span></div>
    </article>`).join('')
  dots.innerHTML = frames.map(() => '<i></i>').join('')
  cards = Array.from(deck.children)
  top = 0
}

/* Depth 0 is the front card; the rest sit behind, pushed down and
   scaled back. Beyond four they are hidden — the reference stacks four. */
function layout (animate = true) {
  const n = cards.length
  if (!n) return
  cards.forEach((c, i) => {
    const depth = (i - top + n) % n
    c.classList.toggle('settling', animate)
    c.classList.remove('gone', 'dragging')
    c.style.zIndex = String(n - depth)
    if (depth > 3) {
      c.style.opacity = '0'
      c.style.transform = 'translateY(42px) scale(.85)'
      c.style.pointerEvents = 'none'
    } else {
      c.style.opacity = depth === 0 ? '1' : String(1 - depth * 0.22)
      c.style.transform = `translateY(${depth * 14}px) scale(${1 - depth * 0.05})`
      c.style.pointerEvents = depth === 0 ? 'auto' : 'none'
    }
  })
  $('#deckIdx').textContent = `${String(top + 1).padStart(2, '0')} / ${String(n).padStart(2, '0')}`
  Array.from(dots.children).forEach((d, i) => d.classList.toggle('on', i === top))
  $('#deckTitle').textContent = frames[top]?.title || 'In your order'
}

function advance (dir = 1) {
  const n = cards.length
  if (n < 2) return
  const card = cards[top]
  if (!reduce && card) {
    card.classList.remove('settling')
    card.classList.add('gone')
    card.style.transform = `translateX(${dir * 140}%) rotate(${dir * 14}deg)`
    card.style.opacity = '0'
  }
  top = (top + 1) % n
  setTimeout(() => layout(true), reduce ? 0 : 260)
}

function retreat () {
  const n = cards.length
  if (n < 2) return
  top = (top - 1 + n) % n
  layout(true)
}

/* ── auto-switch ──────────────────────────────────────────────── */
function startAuto () {
  stopAuto()
  if (reduce || cards.length < 2) return
  auto = setInterval(() => advance(1), AUTO_MS)
}
function stopAuto () { clearInterval(auto); auto = null }
function bumpAuto () { if (auto) startAuto() }     // restart the clock after manual input

deck.addEventListener('pointerenter', stopAuto)
deck.addEventListener('pointerleave', () => { if (frames.length > 1) startAuto() })
document.addEventListener('visibilitychange', () => {
  document.hidden ? stopAuto() : (frames.length > 1 && startAuto())
})

/* ── drag the front card ──────────────────────────────────────── */
let down = false, startX = 0, dx = 0, activeCard = null

deck.addEventListener('pointerdown', (e) => {
  const card = cards[top]
  if (!card || e.target.closest('.deck-card') !== card) return
  stopAuto()
  down = true; startX = e.clientX; dx = 0; activeCard = card
  card.classList.remove('settling')
  card.classList.add('dragging')
  card.setPointerCapture(e.pointerId)
})
deck.addEventListener('pointermove', (e) => {
  if (!down || !activeCard) return
  dx = e.clientX - startX
  activeCard.style.transform = `translateX(${dx}px) rotate(${dx * 0.045}deg)`
  activeCard.style.opacity = String(Math.max(0.35, 1 - Math.abs(dx) / 460))
})
function release () {
  if (!down || !activeCard) return
  down = false
  activeCard.classList.remove('dragging')
  if (Math.abs(dx) > deck.clientWidth * 0.28) advance(Math.sign(dx) || 1)
  else { activeCard.classList.add('settling'); layout(true) }
  activeCard = null; dx = 0
  if (frames.length > 1) startAuto()
}
deck.addEventListener('pointerup', release)
deck.addEventListener('pointercancel', release)

deck.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') { e.preventDefault(); advance(1); bumpAuto() }
  if (e.key === 'ArrowLeft') { e.preventDefault(); retreat(); bumpAuto() }
})
$('#deckNext').addEventListener('click', () => { advance(1); bumpAuto() })
$('#deckPrev').addEventListener('click', () => { retreat(); bumpAuto() })

/* ── order panel ──────────────────────────────────────────────── */
/* Every published price already includes SA VAT, so the VAT line is the
   component inside the total rather than something added on top. */
const VAT_RATE = 0.15
const vatPart = (incl) => incl * VAT_RATE / (1 + VAT_RATE)

$('#clearBtn').addEventListener('click', () => {
  cartStore.clear()
  window.refreshCart?.()
  refresh()
})

linesEl.addEventListener('click', (e) => {
  const b = e.target.closest('[data-rm]')
  if (!b) return
  const lines = cartStore.read()
  lines.splice(Number(b.dataset.rm), 1)
  cartStore.write(lines)
  window.refreshCart?.()
  refresh()
})

function renderOrder () {
  const order = cartStore.read()
  if (!order.length) {
    linesEl.innerHTML = `<p class="empty">Nothing in the cart yet.
      <a href="/products/" style="color:var(--ink)">Browse the catalogue</a> to add fencing.</p>`
    $('#totals').hidden = true
    $('#lineCount').textContent = '0 items'
    return
  }

  linesEl.innerHTML = order.map((l, i) => `
    <div class="line">
      <div class="th">${l.img ? `<img src="${l.img}" alt="">` : ''}</div>
      <div class="info"><b>${l.t}</b><span>${zar(l.unit)} each · ×${l.qty}</span></div>
      <span class="amt">${zar(l.unit * l.qty)}</span>
      <button class="rm" data-rm="${i}" aria-label="Remove ${l.t}">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
      </button>
    </div>`).join('')

  const goods = order.reduce((s, l) => s + l.unit * l.qty, 0)
  const units = order.reduce((s, l) => s + l.qty, 0)

  $('#sumGoods').textContent = zar(goods)
  $('#sumVat').textContent = zar(vatPart(goods))
  $('#sumTotal').textContent = zar(goods)
  $('#lineCount').textContent = `${units} item${units > 1 ? 's' : ''}`
  $('#totals').hidden = false
  renderRecs(order)
}

/* ── "completes the system" — driven by each product's own pairs ── */
function renderRecs (order) {
  const have = new Set(order.map(l => l.id))
  const want = []
  order.forEach(l => (byId(l.id)?.pairs || []).forEach(id => {
    if (!have.has(id) && !want.includes(id)) want.push(id)
  }))
  const recs = want.slice(0, 3).map(byId).filter(Boolean)
  const box = document.getElementById('recBox')
  if (!recs.length) { box.hidden = true; return }
  box.hidden = false
  document.getElementById('recs').innerHTML = recs.map(r => `
    <a class="rec" href="${r.href || '/products/'}">
      <span class="im"><img src="${r.gallery[0]}" alt="${r.t}" loading="lazy"></span>
      <span class="bd">
        <span class="t">${r.t}</span>
        <span class="why">${r.plain}</span>
        <span class="ft">
          <span class="pr">${r.flat ? '' : 'From '}${zar(r.from)}</span>
          <button class="add" type="button" data-add="${r.id}">Add</button>
        </span>
      </span>
    </a>`).join('')
}

document.getElementById('recs')?.addEventListener('click', (e) => {
  const b = e.target.closest('[data-add]')
  if (!b) return
  e.preventDefault()
  const p = byId(b.dataset.add)
  if (!p) return
  window.addToCart?.(1, { id: p.id, t: p.t, unit: p.from, img: p.gallery[0], spec: p.spec })
  refresh()
})

/* ── refresh everything from the store ────────────────────────── */
function refresh () {
  buildFrames()
  renderOrder()

  const empty = frames.length === 0
  deck.hidden = empty
  dots.hidden = empty
  $('#deckPrev').disabled = frames.length < 2
  $('#deckNext').disabled = frames.length < 2

  if (empty) {
    stopAuto()
    $('#deckIdx').textContent = '00 / 00'
    $('#deckTitle').textContent = 'Nothing added yet'
    $('#deckHint').textContent = 'Your fencing will show here'
    return
  }

  renderDeck()
  layout(false)
  $('#deckHint').textContent = frames.length > 1 ? 'Cycling your order' : 'One image'
  startAuto()
}

initCart()
initHero()
refresh()
