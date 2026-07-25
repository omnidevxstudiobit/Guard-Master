/**
 * The rest of the Clear View estimator — posts, fixings, base plates, coils and
 * Y-brackets.
 *
 * An earlier pass read only the six panel groups off the client's quote
 * estimator and stopped there, which missed seven more. This module carries
 * them, and every figure is that page's own `data-*` attribute copied unchanged.
 * Ex VAT throughout, on the same basis as everything else on these pages.
 *
 * **Posts are sold by the metre, not by the post.** The estimator's own control
 * reads "Price Per Meter x Height in Meters": you pick a profile and type a
 * height, and it multiplies. A 76 x 40 pre-galv + powder-coated T-post at
 * R 141.00/m over 10 m is R 1,410.00, and 2.87 kg/m over 10 m is 28.70 kg —
 * which is exactly what their estimator prints.
 *
 * That per-metre rate is also the authority behind the fixed-length prices on
 * their shop listing, and reconciles with them: R 105.00/m x 1.8 m = R 189.00,
 * R 141.00/m x 1.8 m = R 253.80, R 150.00/m x 1.8 m = R 270.00 — all exactly the
 * VAT-adjusted shop prices. Where the two disagreed it was the shop that had
 * rounded: the 100 x 60 pre-galv works out at R 257.40, not the R 257.39 that
 * falls out of dividing their published inclusive price by 1.15. Deriving
 * lengths from the rate removes that whole class of error.
 *
 * `wallMm` is the section's wall thickness, which is why the same 76 x 76 square
 * post appears twice at two prices — 1.6 mm and 2 mm are different products, not
 * a duplicate.
 */

export interface PostRate {
  kind: 't' | 'sq';
  /** The finish exactly as the estimator names it. */
  finish: string;
  /** Section, mm. */
  w: number;
  d: number;
  wallMm: number;
  /** Rand per metre, ex VAT. */
  rate: number;
  kgPerM: number;
}

export const POST_RATES: PostRate[] = [
  { kind: 't', finish: 'PRE GALV', w: 100, d: 60, wallMm: 1.6, rate: 143, kgPerM: 3.88 },
  { kind: 't', finish: 'PRE GALV + P/COATED', w: 100, d: 60, wallMm: 1.6, rate: 189, kgPerM: 3.88 },
  { kind: 't', finish: 'PRE GALV + PLASCOAT', w: 100, d: 60, wallMm: 1.6, rate: 197, kgPerM: 3.88 },
  { kind: 't', finish: 'PRE GALV', w: 76, d: 40, wallMm: 1.6, rate: 105, kgPerM: 2.87 },
  { kind: 't', finish: 'PRE GALV + P/COATED', w: 76, d: 40, wallMm: 1.6, rate: 141, kgPerM: 2.87 },
  { kind: 't', finish: 'PRE GALV + PLASCOAT', w: 76, d: 40, wallMm: 1.6, rate: 153, kgPerM: 2.87 },
  { kind: 'sq', finish: 'BLACK', w: 76, d: 76, wallMm: 1.6, rate: 99, kgPerM: 3.71 },
  { kind: 'sq', finish: 'HDG', w: 76, d: 76, wallMm: 1.6, rate: 150, kgPerM: 3.71 },
  { kind: 'sq', finish: 'HDG', w: 76, d: 76, wallMm: 2, rate: 190.1, kgPerM: 3.71 },
];

export interface LineItem {
  label: string;
  /** Rand each, ex VAT. */
  price: number;
  kg?: number;
  /** Metres covered per unit, where the item is sold by coverage. */
  lengthM?: number;
}

/** Clamps and clamp kits — the fixings that hold panel to post. */
export const FIXINGS: LineItem[] = [
  { label: 'Flat Clamp Kit HDG', price: 7, kg: 0.044 },
  { label: 'Spider Clamps HDG', price: 7, kg: 0.044 },
  { label: 'Flat Clamp Kit Powder Coated', price: 9.5, kg: 0.044 },
  { label: 'Spider Clamps Powder Coated', price: 9.5, kg: 0.044 },
  { label: 'Spider Clamps PVC', price: 12.5, kg: 0.044 },
  { label: 'Flat Clamp Kit PVC', price: 12.5, kg: 0.044 },
];

/** Base plates and brackets, for posts that bolt down instead of setting in concrete. */
export const BASE_PLATES: LineItem[] = [
  { label: 'Base plate 200mm x 200mm x 8mm', price: 145, kg: 0.2 },
  { label: 'Base plate 8mm + anchor bolts', price: 182.61, kg: 0.3 },
  { label: 'Base plate 150mm x 150mm x 6mm', price: 126.09, kg: 0.2 },
  { label: 'Base plate 6mm + anchor bolts', price: 160.87, kg: 0.3 },
  { label: 'Brackets 200mm', price: 200, kg: 0.3 },
  { label: 'Brackets 30mmx30mmx3mm', price: 250, kg: 0.3 },
];

/** Concertina coils, flat wrap, electrified coil and spikes — sold by coverage. */
export const COILS: LineItem[] = [
  { label: 'Concertina coil Ø450mm → 8m per unit', price: 315, lengthM: 8, kg: 6 },
  { label: 'Concertina coil Ø730mm → 10m per unit', price: 462, lengthM: 10, kg: 9.5 },
  { label: 'Concertina coil Ø980mm → 13m per unit', price: 713, lengthM: 13, kg: 13.6 },
  { label: 'Flat wrap Ø500mm → 15m per unit', price: 396, lengthM: 15, kg: 9.14 },
  { label: 'Flat wrap Ø700mm → 15m per unit', price: 516, lengthM: 15, kg: 10.5 },
  { label: 'Flat wrap Ø900mm → 15m per unit', price: 665, lengthM: 15, kg: 12.5 },
  { label: 'Electrified concertina Ø450mm → 5m per unit', price: 772, lengthM: 5, kg: 5.5 },
  { label: 'Electrified concertina Ø730mm → 7m per unit', price: 1069, lengthM: 7, kg: 5.5 },
  { label: 'Electrified concertina Ø980mm → 9m per unit', price: 1426, lengthM: 9, kg: 5.5 },
  { label: 'Multi-Coils Ø450 • Ø730 • Ø980mm → 8m per unit', price: 1639, lengthM: 8, kg: 29.1 },
  {
    label: 'Super Spike Without Fixators Raw → 1.475m per unit',
    price: 94,
    lengthM: 1.475,
    kg: 1.12,
  },
  {
    label: 'Super Spike Without Fixators HDG → 1.475m per unit',
    price: 127,
    lengthM: 1.475,
    kg: 1.12,
  },
  {
    label: 'Super Spike Without Fixators Pre Galv → 1.475m per unit',
    price: 99,
    lengthM: 1.475,
    kg: 1.12,
  },
  {
    label: 'Super Spike Without Fixators Powder Coated → 1.475m per unit',
    price: 132,
    lengthM: 1.475,
    kg: 1.12,
  },
  {
    label: 'Super Spike Without Fixators Plascoat → 1.475m per unit',
    price: 176,
    lengthM: 1.475,
    kg: 1.12,
  },
  {
    label: 'Super Spike With Fixators Raw → 1.475m per unit',
    price: 105,
    lengthM: 1.475,
    kg: 1.12,
  },
  {
    label: 'Super Spike With Fixators HDG → 1.475m per unit',
    price: 138,
    lengthM: 1.475,
    kg: 1.12,
  },
  {
    label: 'Super Spike With Fixators Pre Galv → 1.475m per unit',
    price: 110,
    lengthM: 1.475,
    kg: 1.12,
  },
  {
    label: 'Super Spike With Fixators Powder-coated → 1.475m per unit',
    price: 143,
    lengthM: 1.475,
    kg: 1.12,
  },
  {
    label: 'Super Spike With Fixators Plascoat → 1.475m per unit',
    price: 187,
    lengthM: 1.475,
    kg: 1.12,
  },
];

/** Y-brackets that carry concertina coils off the top of a fence line. */
export const Y_BRACKETS: LineItem[] = [
  { label: 'Y-Bracket 450mm x 40mm x 3mm — RAW, No Bolts', price: 107.86, lengthM: 0.45 },
  { label: 'Y-Bracket 730mm x 40mm x 2mm — GALV, No Bolts', price: 140.41, lengthM: 0.73 },
  { label: 'Y-Bracket 730mm x 40mm x 2mm — GALV + PPC, No Bolts', price: 172.47, lengthM: 0.73 },
  { label: 'Y-Bracket 730mm x 40mm x 2mm — RAW + PPC, No Bolts', price: 143.51, lengthM: 0.73 },
  { label: 'Y-Bracket 730mm x 40mm x 2mm — RAW + PVC, No Bolts', price: 182.85, lengthM: 0.73 },
  { label: 'Y-Bracket 730mm x 40mm x 2mm — RAW, No Bolts', price: 111.45, lengthM: 0.73 },
  { label: 'Y-Bracket 730mm x 40mm x 3mm — GALV, No Bolts', price: 167.77, lengthM: 0.73 },
  { label: 'Y-Bracket 730mm x 40mm x 3mm — GALV + PPC, No Bolts', price: 199.83, lengthM: 0.73 },
  { label: 'Y-Bracket 730mm x 40mm x 3mm — RAW + PPC, No Bolts', price: 143.51, lengthM: 0.73 },
  { label: 'Y-Bracket 730mm x 40mm x 3mm — RAW + PVC, No Bolts', price: 198.58, lengthM: 0.73 },
  { label: 'Y-Bracket 730mm x 40mm x 3mm — RAW, No Bolts', price: 126.41, lengthM: 0.73 },
  { label: 'Y-Bracket 980mm x 40mm x 2mm — GALV, No Bolts', price: 162.38, lengthM: 0.98 },
  { label: 'Y-Bracket 980mm x 40mm x 2mm — GALV + PPC, No Bolts', price: 204.38, lengthM: 0.98 },
  { label: 'Y-Bracket 980mm x 40mm x 2mm — RAW + PPC, No Bolts', price: 167.01, lengthM: 0.98 },
  { label: 'Y-Bracket 980mm x 40mm x 2mm — RAW + PVC, No Bolts', price: 217.15, lengthM: 0.98 },
  { label: 'Y-Bracket 980mm x 40mm x 2mm — RAW, No Bolts', price: 125.01, lengthM: 0.98 },
  { label: 'Y-Bracket 980mm x 40mm x 3mm — GALV, No Bolts', price: 193.9, lengthM: 0.98 },
  { label: 'Y-Bracket 980mm x 40mm x 3mm — GALV + PPC, No Bolts', price: 235.9, lengthM: 0.98 },
  { label: 'Y-Bracket 980mm x 40mm x 3mm — RAW + PPC, No Bolts', price: 182.51, lengthM: 0.98 },
  { label: 'Y-Bracket 980mm x 40mm x 3mm — RAW + PVC, No Bolts', price: 233.64, lengthM: 0.98 },
  { label: 'Y-Bracket 980mm x 40mm x 3mm — RAW, No Bolts', price: 140.51, lengthM: 0.98 },
];
