/* Real catalogue, scraped from the live factory site (fencing-supplier.com).
   `from` is the published "From:" price in ZAR incl. VAT. `options` are the
   real WooCommerce variation attributes, in the order the factory lists them.
   Nothing here is invented — no product is priced "on application".

   The store owner can override title/price/copy and hide products from
   /admin/ — overrides merge in below, before any page reads PRODUCTS. */

import { OV, SETTINGS } from './overrides.js'

export const PRODUCTS = [
  {
    id: 'panels', g: 'clearview', href: '/products/clear-view-panels/',
    t: 'Clear View fencing panels',
    d: '358 anti-climb mesh. The aperture is too tight for a toehold and too narrow for bolt-cutter jaws.',
    plain: 'The fence itself. Panels bolt between posts to form the run.',
    from: 550.85,
    spec: '3m wide · 1.8 – 3.0m high',
    tags: ['76×12.7', '76×25', '76×50'],
    options: [
      { k: 'Aperture', v: ['76mm × 12.7mm', '76mm × 25mm', '76mm × 50mm'], note: ['High security', 'Medium security', 'Standard security'] },
      { k: 'Panel size', v: ['3m × 1.8m', '3m × 2.1m', '3m × 2.4m', '3m × 3m'] },
      { k: 'Wire size', v: ['3mm × 4mm', '4mm × 4mm'] },
      { k: 'Finish', v: ['Plain Galvanised', 'Dipped', 'Powder Coated', 'Plascoat / 10yr'] },
    ],
    gallery: [
      '/images/products/clear-view-fencing-panels/30-640.webp',
      '/images/products/clear-view-fencing-panels/56-640.webp',
      '/images/products/clear-view-fencing-panels/17-640.webp',
      '/images/products/clear-view-fencing-panels/4-640.webp',
      '/images/products/clear-view-after-dark/clear-view-residential-sightline-through-mesh-dusk-960.webp',
    ],
    pairs: ['posts', 'clamps', 'spikes'],
  },
  {
    id: 'posts', g: 'clearview',
    t: 'Clear View fencing posts',
    d: 'Square and T-post profiles, capped and drilled for spike topping.',
    plain: 'What the panels bolt to. You need one roughly every 3 metres.',
    from: 217.35,
    spec: '1.8 – 3.6m · four finishes',
    tags: ['Guard Master', 'T-post', 'SQ post'],
    options: [
      { k: 'Post type', v: ['Guard Master Post', 'T-Post 100mm × 60mm', 'T-Post 76mm × 40mm', 'SQ Post 76mm × 76mm'] },
      { k: 'Post length', v: ['1.8m', '2.1m', '2.4m', '3.0m', '3.6m'], note: ['6′', '7′', '8′', '10′', '12′'] },
      { k: 'Finish', v: ['Pre-galvanized', 'HDG', 'Powder-Coated', 'Plascoat'] },
    ],
    gallery: [
      '/images/products/clear-view-fencing-posts/34-640.webp',
      '/images/products/clear-view-fencing-posts/35-640.webp',
      '/images/products/clear-view-fencing-posts/img-5074-960.webp',
      '/images/products/clear-view-fencing-posts/img-5089-960.webp',
    ],
    pairs: ['panels', 'clamps', 'caps'],
  },
  {
    id: 'vista', g: 'clearview',
    t: 'Guard Master Vista range',
    d: 'Lighter-gauge clear-view for estate and residential boundaries.',
    plain: 'A slimmer, cheaper version for homes rather than industrial sites.',
    from: 464.60,
    spec: '3m wide · 1.2 – 2.0m high',
    tags: ['Estate', 'Residential'],
    options: [
      { k: 'Panel size', v: ['3m × 1.2m', '3m × 1.5m', '3m × 1.8m', '3m × 2m'] },
      { k: 'Finish', v: ['Plain Galvanised', 'Dipped', 'Powder Coated'] },
    ],
    gallery: [
      '/images/products/clear-view-fencing-panels/8-640.webp',
      '/images/products/clear-view-fencing-panels/52-640.webp',
      '/images/products/clear-view-fencing-panels/18-640.webp',
    ],
    pairs: ['posts', 'clamps', 'caps'],
  },
  {
    id: 'gates', g: 'clearview',
    t: 'Clear View sliding gates',
    d: 'Matched mesh infill on a sliding frame, built to your opening width.',
    plain: 'The gate. Same mesh as the fence so the boundary reads as one line.',
    from: 12083.05,
    spec: '3.0 – 6.0m wide',
    tags: ['3m', '4m', '5m', '6m'],
    options: [
      { k: 'Aperture', v: ['76mm × 12.7mm', '76mm × 25mm', '76mm × 50mm'], note: ['High security', 'Medium security', 'Standard security'] },
      { k: 'Gate height', v: ['1800mm', '2100mm', '2400mm'] },
      { k: 'Gate width', v: ['3000mm', '4000mm', '5000mm', '6000mm'] },
      { k: 'Coating', v: ['Galvanized', 'Powder Coated'] },
    ],
    gallery: [
      '/images/products/accessories/sliding-gate-galvanized-clear-view-mesh-filling-reinforced-intermedia-spikes-600x442-600.webp',
      '/images/products/clear-view-fencing-panels/clear-view-fencing-commercial-property-high-security-fencing-600x442-600.webp',
    ],
    pairs: ['hinges', 'posts', 'panels'],
  },
  {
    id: 'clamps', g: 'access',
    t: 'Spider clamps & fixators',
    d: 'Anti-tamper fixings that grip the panel edge and resist prying.',
    plain: 'The brackets that hold panels onto posts. Sold per unit.',
    from: 8.06,
    spec: 'Per unit · bulk kits available',
    tags: ['HDG', 'Powder Coated', 'PVC'],
    options: [
      { k: 'Fixator kit', v: ['Flat Clamp Kit HDG', 'Flat Clamp Kit Powder Coated', 'Flat Clamp Kit PVC'] },
    ],
    gallery: [
      '/images/products/fixtures-and-screws/32-640.webp',
      '/images/products/fixtures-and-screws/30-640.webp',
    ],
    pairs: ['panels', 'posts'],
  },
  {
    id: 'hinges', g: 'access',
    t: 'Clear View gate hinges',
    d: 'Heavy-duty hinges for swing and pedestrian leaves.',
    plain: 'Hinges for a swinging gate.',
    from: 184.00, flat: true,
    spec: 'Incl. VAT, per hinge',
    tags: ['Swing', 'Pedestrian'],
    options: [],
    gallery: [
      '/images/products/accessories/36-640.webp',
      '/images/products/clear-view-fencing-posts/32-640.webp',
    ],
    pairs: ['gates', 'posts'],
  },
  {
    id: 'spikes', g: 'access',
    t: 'Anti-climb wall spikes',
    d: 'Super Spike topping, with or without fixators, in five finishes.',
    plain: 'Spikes along the top. Optional, but it is what stops someone going over.',
    from: 108.10,
    spec: 'Retro-fits existing runs',
    tags: ['Super Spike', 'With fixators'],
    options: [
      { k: 'Spike', v: ['Super Spike'] },
      { k: 'Fixators', v: ['Without Fixators', 'With fixators'] },
      { k: 'Finish', v: ['Raw', 'HDG', 'Pre Galv', 'Powder Coated', 'Plascoat / 10 years warranty'] },
    ],
    gallery: [
      '/images/products/accessories/clear-view-fence-anti-climb-reinforced-with-shark-tooth-spikes-600x442-600.webp',
      '/images/products/clear-view-fencing-panels/56-640.webp',
      '/images/products/clear-view-fencing-panels/58-640.webp',
    ],
    pairs: ['panels', 'posts'],
  },
  {
    id: 'caps', g: 'access',
    t: 'Solar post caps',
    d: 'Lights the run after dark with no trenching and no supply.',
    plain: 'Caps that sit on the posts and light the fence at night.',
    from: 184.00, flat: true,
    spec: 'Four finishes',
    tags: ['4 finishes'],
    options: [],
    gallery: [
      '/images/products/accessories-caps/solar-post-caps-lit-four-finishes-960.webp',
      '/images/products/accessories-caps/solar-post-caps-on-fence-run-night-960.webp',
      '/images/products/accessories-caps/img-5053-960.webp',
      '/images/products/accessories-caps/img-5084-960.webp',
    ],
    pairs: ['posts', 'panels'],
  },
  {
    id: 'razormesh', g: 'razor',
    t: 'Razor wire mesh',
    d: 'Diamond mesh with integrated blade, in standard or high density.',
    plain: 'Mesh with blades built in. For high-risk perimeters, not homes.',
    from: 404.80,
    spec: '6.0m rolls · 1.2 – 2.4m high',
    tags: ['Standard', 'High-density'],
    options: [
      { k: 'Density', v: ['Standard 300mm × 150mm', 'High-Density 150mm × 75mm'] },
      { k: 'Height', v: ['Height 1.2m Length 6.0m', 'Height 1.8m Length 6.0m', 'Height 2.1m Length 6.0m', 'Height 2.4m Length 6.0m'] },
    ],
    gallery: [
      '/images/products/razor-wire-mesh/img-6277-960.webp',
      '/images/products/razor-wire-mesh/img-6282-960.webp',
      '/images/products/razor-wire-mesh/42-640.webp',
      '/images/products/razor-wire-mesh/dji-20250930-103020-472-960.webp',
    ],
    pairs: ['razorposts', 'coils'],
  },
  {
    id: 'razorposts', g: 'razor',
    t: 'Razor wire mesh posts',
    d: 'Main, intermediate and stay posts with base plates.',
    plain: 'The posts that hold razor wire mesh up.',
    from: 181.72,
    spec: '1800 – 3000mm · HDG',
    tags: ['Main', 'Intermediate', 'Stay'],
    options: [
      { k: 'Post type', v: ['Main Round Posts', 'Intermedia Posts', 'Stay Posts'] },
      { k: 'Height', v: ['1800mm', '2400mm', '2700mm', '3000mm'] },
      { k: 'Diameter', v: ['38mm', '48mm', '76mm', '101mm'] },
      { k: 'Thickness', v: ['1.6mm', '2.0mm'] },
      { k: 'Finish', v: ['HDG'] },
    ],
    gallery: [
      '/images/products/razor-wire-mesh-posts/razor-wire-mesh-installation-posts-950.webp',
      '/images/products/razor-wire-mesh-posts/dji-20250930-103133-031-960.webp',
      '/images/products/razor-wire-mesh-posts/069cfd6a-a505-41c1-85d8-1b7024b10a6f-960.webp',
    ],
    pairs: ['razormesh', 'coils'],
  },
  {
    id: 'coils', g: 'razor',
    t: 'Concertina razor wire coils',
    d: 'Super Blade coils in three diameters, as topping or standalone.',
    plain: 'The spiral razor coils you see on top of walls.',
    from: 362.25,
    spec: 'Ø450 / 730 / 980mm',
    tags: ['Ø450', 'Ø730', 'Ø980'],
    options: [
      { k: 'Coil diameter', v: ['Ø450mm', 'Ø730mm', 'Ø980mm'] },
      { k: 'Tape type', v: ['Super Blade'] },
    ],
    gallery: [
      '/images/products/concertina-razor-wire/concertina-razor-wire-coils-diameter-980mm-1-950.webp',
      '/images/products/concertina-razor-wire/44-640.webp',
      '/images/products/concertina-razor-wire/45-640.webp',
      '/images/products/concertina-razor-wire/54-640.webp',
    ],
    pairs: ['flatwrap', 'razormesh'],
  },
  {
    id: 'flatwrap', g: 'razor',
    t: 'Razor wire flat wrap',
    d: 'Flat-wrap coils for wall topping where a concertina is too deep.',
    plain: 'A flatter version of the razor coil, for narrow wall tops.',
    from: 455.40,
    spec: 'Ø500 / 700 / 900mm',
    tags: ['Ø500', 'Ø700', 'Ø900'],
    options: [
      { k: 'Coil diameter', v: ['Ø500mm', 'Ø700mm', 'Ø900mm'] },
      { k: 'Tape type', v: ['Super Blade'] },
    ],
    gallery: [
      '/images/products/concertina-razor-wire/concertina-razor-wire-coils-diameter-980mm-1-480.webp',
      '/images/products/concertina-razor-wire/54-640.webp',
    ],
    pairs: ['coils', 'spikes'],
  },
]

/* pristine snapshot for /admin/ — the factory truth before any
   override or hiding is applied */
export const CATALOGUE = PRODUCTS.map(p => ({ ...p }))

/* apply the owner's overrides, then drop hidden products from every
   grid, rail and search — byId stops resolving them too */
{
  const po = OV.products || {}
  const validGallery = (g) => Array.isArray(g) && g.length &&
    g.every(src => typeof src === 'string' && src.startsWith('/'))
  const validOptions = (os) => Array.isArray(os) &&
    os.every(o => o && typeof o.k === 'string' && o.k.trim() &&
      Array.isArray(o.v) && o.v.length && o.v.every(v => typeof v === 'string' && v.trim()))
  for (const p of PRODUCTS) {
    const o = po[p.id]
    if (!o) continue
    if (typeof o.t === 'string' && o.t.trim()) p.t = o.t.trim()
    if (typeof o.d === 'string' && o.d.trim()) p.d = o.d.trim()
    if (typeof o.plain === 'string' && o.plain.trim()) p.plain = o.plain.trim()
    if (typeof o.spec === 'string' && o.spec.trim()) p.spec = o.spec.trim()
    if (typeof o.lead === 'string' && o.lead.trim()) p.lead = o.lead.trim()
    if (Number(o.from) > 0) p.from = Number(o.from)
    if (validGallery(o.gallery)) p.gallery = o.gallery
    if (Array.isArray(o.pairs)) p.pairs = o.pairs
    if (['clearview', 'razor', 'access'].includes(o.g)) p.g = o.g
    if (Array.isArray(o.tags) && o.tags.every(t => typeof t === 'string' && t.trim())) p.tags = o.tags
    /* option labels are pricing keys — an edited label that no longer
       resolves falls back to "From price · confirmed on order", never a
       wrong number, so owner edits degrade honestly */
    if (validOptions(o.options)) p.options = o.options
  }
  for (let i = PRODUCTS.length - 1; i >= 0; i--) {
    if (po[PRODUCTS[i].id]?.hidden) PRODUCTS.splice(i, 1)
  }
  /* the owner decides who comes first — settings.productOrder ranks the
     catalogue everywhere PRODUCTS is mapped in order (home grid, the
     catalogue deck); unranked products keep their relative order */
  const ord = Array.isArray(SETTINGS.productOrder) ? SETTINGS.productOrder : []
  if (ord.length) {
    const rank = new Map(ord.map((id, i) => [id, i]))
    PRODUCTS.sort((a, b) => (rank.get(a.id) ?? 1e6) - (rank.get(b.id) ?? 1e6))
  }
}

export const byId = (id) => PRODUCTS.find(p => p.id === id)

/* every product has a page: its own if it has one, else the template */
export const itemHref = (id) => {
  const p = byId(id)
  return p?.href || `/products/item/?p=${id}`
}

/* Catalogue data stays the factory's ZAR truth; DISPLAY is USD.
   One declared indicative rate converts everything — update it here
   (or wire a live feed) and the whole site follows. The function
   keeps its old name so every call site converts automatically. */
export const ZAR_PER_USD = Number(SETTINGS.rateZarPerUsd) > 0
  ? Number(SETTINGS.rateZarPerUsd)
  : 16.40   // indicative, set 2026-08-06 — /admin/ Store info can override
export const zar = (n) =>
  '$' + (n / ZAR_PER_USD).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')

export const ARROW = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7M9 7h8v8"/></svg>`

export function cardHTML (p) {
  return `<a class="pcard" data-g="${p.g}" data-name="${p.t.toLowerCase()}" href="${itemHref(p.id)}">
      <div class="im"><img src="${p.gallery[0]}" alt="${p.t}" loading="lazy">${p.gallery[1] ? `<img class="alt" src="${p.gallery[1]}" alt="" loading="lazy">` : ''}</div>
      <div class="bd">
        <span class="t">${p.t}</span>
        <span class="d">${p.d}</span>
        <span class="ft"><span class="pr">${p.flat ? '' : 'From '}${zar(p.from)}</span><span class="arw">${ARROW}</span></span>
      </div>
    </a>`
}
