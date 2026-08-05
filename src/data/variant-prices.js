/* Variant pricing, carried over from the client's own instant-quote
   estimator on fencing-supplier.com (recovered from this repo's history —
   every figure is theirs, ex VAT, exactly as their estimator publishes it).
   The estimator's own arithmetic: total ex VAT, VAT = ×0.15, incl = ×1.15.
   Cross-checks hold to the cent: panels From R550,85 = 479 × 1.15,
   posts From R217,35 = 105 × 1.8 × 1.15, spikes From R108,10 = 94 × 1.15. */

export const VAT = 0.15
export const inclVat = (ex) => Math.round(ex * (1 + VAT) * 100) / 100

/* ── Clear View panels — all 96 real configurations ─────────────
   [wire][grade][heightMm] → ex-VAT price per 3m panel, by finish. */
export const PANELS = {
  'w3x4': {
    high: {   // 76mm × 12.7mm
      1800: { plainGalv: 1106, dipped: 1235, powderCoated: 1392, plascoat: 1457 },
      2100: { plainGalv: 1283, dipped: 1432, powderCoated: 1615, plascoat: 1688 },
      2400: { plainGalv: 1459, dipped: 1629, powderCoated: 1839, plascoat: 1919 },
      3000: { plainGalv: 1823, dipped: 2035, powderCoated: 2296, plascoat: 2391 },
    },
    medium: { // 76mm × 25mm
      1800: { plainGalv: 692, dipped: 773, powderCoated: 967, plascoat: 1043 },
      2100: { plainGalv: 803, dipped: 896, powderCoated: 1123, plascoat: 1208 },
      2400: { plainGalv: 913, dipped: 1019, powderCoated: 1278, plascoat: 1372 },
      3000: { plainGalv: 1140, dipped: 1272, powderCoated: 1595, plascoat: 1708 },
    },
    low: {    // 76mm × 50mm
      1800: { plainGalv: 479, dipped: 534, powderCoated: 743, plascoat: 829 },
      2100: { plainGalv: 555, dipped: 619, powderCoated: 862, plascoat: 960 },
      2400: { plainGalv: 631, dipped: 704, powderCoated: 981, plascoat: 1090 },
      3000: { plainGalv: 787, dipped: 878, powderCoated: 1224, plascoat: 1355 },
    },
  },
  'w4x4': {
    high: {
      1800: { plainGalv: 1967, dipped: 2095.3, powderCoated: 2264.79, plascoat: 2446.4 },
      2100: { plainGalv: 2282, dipped: 2430.8, powderCoated: 2627.31, plascoat: 2837.9 },
      2400: { plainGalv: 2596, dipped: 2765.28, powderCoated: 2988.83, plascoat: 3228.4 },
      3000: { plainGalv: 3241, dipped: 3452.14, powderCoated: 3728.87, plascoat: 4026.4 },
    },
    medium: {
      1800: { plainGalv: 1147, dipped: 1221.83, powderCoated: 1431.25, plascoat: 1626.4 },
      2100: { plainGalv: 1330, dipped: 1416.37, powderCoated: 1659.62, plascoat: 1885.9 },
      2400: { plainGalv: 1512, dipped: 1610.63, powderCoated: 1886.96, plascoat: 2144.4 },
      3000: { plainGalv: 1888, dipped: 2011.1, powderCoated: 2353.69, plascoat: 2673.4 },
    },
    low: {
      1800: { plainGalv: 724, dipped: 771.23, powderCoated: 994.72, plascoat: 1175.2 },
      2100: { plainGalv: 839, dipped: 893.68, powderCoated: 1152.92, plascoat: 1362.2 },
      2400: { plainGalv: 953, dipped: 1015.15, powderCoated: 1310.12, plascoat: 1548.2 },
      3000: { plainGalv: 1188, dipped: 1265.5, powderCoated: 1631.52, plascoat: 1927.2 },
    },
  },
}

/* label → key maps for the panel configurator */
export const PANEL_KEYS = {
  wire: { '3mm × 4mm': 'w3x4', '4mm × 4mm': 'w4x4' },
  grade: { '76mm × 12.7mm': 'high', '76mm × 25mm': 'medium', '76mm × 50mm': 'low' },
  height: { '3m × 1.8m': 1800, '3m × 2.1m': 2100, '3m × 2.4m': 2400, '3m × 3m': 3000 },
  finish: { 'Plain Galvanised': 'plainGalv', 'Dipped': 'dipped', 'Powder Coated': 'powderCoated', 'Plascoat / 10yr': 'plascoat' },
}

export function panelUnit ({ wire, aperture, size, finish }) {
  const ex = PANELS[PANEL_KEYS.wire[wire]]
    ?.[PANEL_KEYS.grade[aperture]]
    ?.[PANEL_KEYS.height[size]]
    ?.[PANEL_KEYS.finish[finish]]
  return ex ? inclVat(ex) : null
}

/* ── assembly constants, from the manufacturer's dimensioned drawing ──
   panel height → post length (balance sits below grade), and spider
   clamps per panel ("8 × 2" on the drawing = eight a side). */
export const POST_LENGTH_MM = { 1800: 2400, 2100: 2700, 2400: 3000, 3000: 3600 }
export const CLAMPS_PER_PANEL = { 1800: 16, 2100: 20, 2400: 24, 3000: 28 }

/* ── posts — sold by the metre; unit = rate × length × VAT ─────── */
export const POST_RATES = {
  'T-Post 100mm × 60mm': { 'Pre-galvanized': 143, 'Powder-Coated': 189, 'Plascoat': 197 },
  'T-Post 76mm × 40mm': { 'Pre-galvanized': 105, 'Powder-Coated': 141, 'Plascoat': 153 },
  'SQ Post 76mm × 76mm': { 'HDG': 150 },
}

/* ── per-unit line items, ex VAT ───────────────────────────────── */
export const FIXINGS = {
  'Flat Clamp Kit HDG': 7, 'Flat Clamp Kit Powder Coated': 9.5, 'Flat Clamp Kit PVC': 12.5,
}
export const SPIKES = {
  'Without Fixators': { 'Raw': 94, 'HDG': 127, 'Pre Galv': 99, 'Powder Coated': 132, 'Plascoat / 10 years warranty': 176 },
  'With fixators': { 'Raw': 105, 'HDG': 138, 'Pre Galv': 110, 'Powder Coated': 143, 'Plascoat / 10 years warranty': 187 },
}
/* concertina coils cover 8 / 10 / 13 m per unit respectively */
export const COILS = { 'Ø450mm': 315, 'Ø730mm': 462, 'Ø980mm': 713 }
export const COIL_COVER_M = { 'Ø450mm': 8, 'Ø730mm': 10, 'Ø980mm': 13 }
const FLATWRAP = { 'Ø500mm': 396, 'Ø700mm': 516, 'Ø900mm': 665 }

/* ── resolve a product's picked options to a real unit price ─────
   Returns { unit, exact } — exact:false means the catalogue's From
   price stands and the final figure is confirmed on order. */
export function resolveUnit (p, picks) {
  const pick = (k) => picks[k]
  switch (p.id) {
    case 'posts': {
      const rate = POST_RATES[pick('Post type')]?.[pick('Finish')]
      const len = parseFloat(pick('Post length'))
      return rate && len ? { unit: inclVat(rate * len), exact: true } : { unit: p.from, exact: false }
    }
    case 'clamps': {
      const ex = FIXINGS[pick('Fixator kit')]
      return ex ? { unit: inclVat(ex), exact: true } : { unit: p.from, exact: false }
    }
    case 'spikes': {
      const ex = SPIKES[pick('Fixators')]?.[pick('Finish')]
      return ex ? { unit: inclVat(ex), exact: true } : { unit: p.from, exact: false }
    }
    case 'coils': {
      const ex = COILS[pick('Coil diameter')]
      return ex ? { unit: inclVat(ex), exact: true } : { unit: p.from, exact: false }
    }
    case 'flatwrap': {
      const ex = FLATWRAP[pick('Coil diameter')]
      return ex ? { unit: inclVat(ex), exact: true } : { unit: p.from, exact: false }
    }
    case 'caps':
    case 'hinges':
      return { unit: p.from, exact: true }        // flat, VAT-inclusive
    default:
      return { unit: p.from, exact: false }       // vista, gates, razor lines
  }
}
