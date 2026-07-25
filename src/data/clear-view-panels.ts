/**
 * Clear View panel pricing, read off the client's own instant-quote estimator
 * on fencing-supplier.com/products/clear-view-fencing/.
 *
 * Ninety-six real configurations: two wire sizes, three security grades, four
 * heights, four finishes. Every `ex` figure below is the estimator's own
 * `data-price` attribute for that exact option, copied unchanged.
 *
 * **The prices are exclusive of VAT, and that is also how they are displayed.**
 * Their `updateGrandTotal` sums the selected options' `data-price` values and
 * writes the sum straight into the "Total Excl. VAT" field, then computes
 * `VAT = sum x 0.15` and `Incl = sum + VAT`:
 *
 *     o.forEach(t => { s += parseFloat($(t.priceField).val()) || 0 })
 *     const a = s * .15, r = s + a
 *     $("#totalExclVat").val(s); $("#totalVat").val(a); $("#totalInclVat").val(r)
 *
 * Their option labels print that same ex-VAT figure ("… plain galv. => R
 * 1,106.00"), so a panel priced R 1 106,00 on their site must read R 1 106,00
 * on ours. An earlier pass here displayed the VAT-inclusive figure instead,
 * which made every price on the page 15% higher than the same panel on the
 * manufacturer's own quote — right arithmetic, wrong basis, and the kind of
 * mismatch nobody notices until a customer compares two tabs.
 *
 * The 15% rate is corroborated independently: the cheapest configuration here
 * — 1 800 mm, 76 x 50 mm, plain galvanised — is R 479,00, and R 479 x 1.15 is
 * R 550,85, exactly the VAT-inclusive price the same company publishes for a
 * Clear View panel on its shop listing. Two pages of theirs agree to the cent.
 *
 * `inclVat()` therefore exists for the totals block only, never for a
 * per-panel price.
 *
 * `massKg` is the estimator's `data-weight` for the same option — the panel's
 * own mass, which is what decides handling and freight.
 *
 * POST_LENGTH_MM and SPIDER_CLAMPS come from the manufacturer's own dimensioned
 * assembly drawing for this product ("1.8m H - 8 x 2 Spider Clamps", post
 * lengths 2400 / 2700 / 3000 / 3600 mm against panel heights 1800 / 2100 /
 * 2400 / 3000 mm). They are per-height constants and do not vary with aperture,
 * wire size or finish, which is why they live beside the table rather than in
 * every row of it.
 */

export const VAT_RATE = 0.15;

/** Ex-VAT rand -> VAT-inclusive rand, rounded to the cent. */
export const inclVat = (ex: number): number => Math.round(ex * (1 + VAT_RATE) * 100) / 100;

export type FinishKey = 'plainGalv' | 'dipped' | 'powderCoated' | 'plascoat';

export const FINISHES: { key: FinishKey; label: string; short: string }[] = [
  { key: 'plainGalv', label: 'Plain galvanised', short: 'Plain galv' },
  { key: 'dipped', label: 'Hot-dip galvanised', short: 'Dipped' },
  { key: 'powderCoated', label: 'Powder coated', short: 'Powder' },
  { key: 'plascoat', label: 'Plascoat', short: 'Plascoat' },
];

export interface PanelRow {
  heightMm: number;
  /** Mass of the panel itself, kg. */
  massKg: number;
  /** Ex-VAT price per 3 000 mm panel, by finish. */
  ex: Record<FinishKey, number>;
}

export interface PanelGrade {
  id: 'high' | 'medium' | 'low';
  label: string;
  aperture: string;
  rows: PanelRow[];
}

export interface WireSize {
  id: string;
  label: string;
  grades: PanelGrade[];
}

/** Post length and spider-clamp count for a given panel height. */
export const POST_LENGTH_MM: Record<number, number> = {
  1800: 2400,
  2100: 2700,
  2400: 3000,
  3000: 3600,
};

/** "8 x 2" on the drawing: eight clamps a side, so sixteen per panel. */
export const SPIDER_CLAMPS: Record<number, { perSide: number; total: number }> = {
  1800: { perSide: 8, total: 16 },
  2100: { perSide: 10, total: 20 },
  2400: { perSide: 12, total: 24 },
  3000: { perSide: 14, total: 28 },
};

/** Nominal panel width. The drawing calls it 3 000 mm and dimensions the
 *  as-built overall at 3 013 mm across the two posts. */
export const PANEL_WIDTH_MM = 3000;
export const PANEL_WIDTH_OVERALL_MM = 3013;

export const WIRE_SIZES: WireSize[] = [
  {
    id: 'w3x4',
    label: 'Ø 3 mm × Ø 4 mm',
    grades: [
      {
        id: 'high',
        label: 'High Security',
        aperture: '76mm × 12.7mm',
        rows: [
          {
            heightMm: 1800,
            massKg: 32.17,
            ex: { plainGalv: 1106, dipped: 1235, powderCoated: 1392, plascoat: 1457 },
          },
          {
            heightMm: 2100,
            massKg: 37.31,
            ex: { plainGalv: 1283, dipped: 1432, powderCoated: 1615, plascoat: 1688 },
          },
          {
            heightMm: 2400,
            massKg: 42.45,
            ex: { plainGalv: 1459, dipped: 1629, powderCoated: 1839, plascoat: 1919 },
          },
          {
            heightMm: 3000,
            massKg: 53.02,
            ex: { plainGalv: 1823, dipped: 2035, powderCoated: 2296, plascoat: 2391 },
          },
        ],
      },
      {
        id: 'medium',
        label: 'Medium Security',
        aperture: '76mm × 25mm',
        rows: [
          {
            heightMm: 1800,
            massKg: 20.14,
            ex: { plainGalv: 692, dipped: 773, powderCoated: 967, plascoat: 1043 },
          },
          {
            heightMm: 2100,
            massKg: 23.34,
            ex: { plainGalv: 803, dipped: 896, powderCoated: 1123, plascoat: 1208 },
          },
          {
            heightMm: 2400,
            massKg: 26.55,
            ex: { plainGalv: 913, dipped: 1019, powderCoated: 1278, plascoat: 1372 },
          },
          {
            heightMm: 3000,
            massKg: 33.15,
            ex: { plainGalv: 1140, dipped: 1272, powderCoated: 1595, plascoat: 1708 },
          },
        ],
      },
      {
        id: 'low',
        label: 'Low Security',
        aperture: '76mm × 50mm',
        rows: [
          {
            heightMm: 1800,
            massKg: 13.92,
            ex: { plainGalv: 479, dipped: 534, powderCoated: 743, plascoat: 829 },
          },
          {
            heightMm: 2100,
            massKg: 16.13,
            ex: { plainGalv: 555, dipped: 619, powderCoated: 862, plascoat: 960 },
          },
          {
            heightMm: 2400,
            massKg: 18.34,
            ex: { plainGalv: 631, dipped: 704, powderCoated: 981, plascoat: 1090 },
          },
          {
            heightMm: 3000,
            massKg: 22.89,
            ex: { plainGalv: 787, dipped: 878, powderCoated: 1224, plascoat: 1355 },
          },
        ],
      },
    ],
  },
  {
    id: 'w4x4',
    label: 'Ø 4 mm × Ø 4 mm',
    grades: [
      {
        id: 'high',
        label: 'High Security',
        aperture: '76mm × 12.7mm',
        rows: [
          {
            heightMm: 1800,
            massKg: 51.32,
            ex: { plainGalv: 1967, dipped: 2095.3, powderCoated: 2264.79, plascoat: 2446.4 },
          },
          {
            heightMm: 2100,
            massKg: 59.52,
            ex: { plainGalv: 2282, dipped: 2430.8, powderCoated: 2627.31, plascoat: 2837.9 },
          },
          {
            heightMm: 2400,
            massKg: 67.71,
            ex: { plainGalv: 2596, dipped: 2765.28, powderCoated: 2988.83, plascoat: 3228.4 },
          },
          {
            heightMm: 3000,
            massKg: 84.56,
            ex: { plainGalv: 3241, dipped: 3452.14, powderCoated: 3728.87, plascoat: 4026.4 },
          },
        ],
      },
      {
        id: 'medium',
        label: 'Medium Security',
        aperture: '76mm × 25mm',
        rows: [
          {
            heightMm: 1800,
            massKg: 32.17,
            ex: { plainGalv: 1147, dipped: 1221.83, powderCoated: 1431.25, plascoat: 1626.4 },
          },
          {
            heightMm: 2100,
            massKg: 37.31,
            ex: { plainGalv: 1330, dipped: 1416.37, powderCoated: 1659.62, plascoat: 1885.9 },
          },
          {
            heightMm: 2400,
            massKg: 42.45,
            ex: { plainGalv: 1512, dipped: 1610.63, powderCoated: 1886.96, plascoat: 2144.4 },
          },
          {
            heightMm: 3000,
            massKg: 53.02,
            ex: { plainGalv: 1888, dipped: 2011.1, powderCoated: 2353.69, plascoat: 2673.4 },
          },
        ],
      },
      {
        id: 'low',
        label: 'Low Security',
        aperture: '76mm × 50mm',
        rows: [
          {
            heightMm: 1800,
            massKg: 32.17,
            ex: { plainGalv: 724, dipped: 771.23, powderCoated: 994.72, plascoat: 1175.2 },
          },
          {
            heightMm: 2100,
            massKg: 37.31,
            ex: { plainGalv: 839, dipped: 893.68, powderCoated: 1152.92, plascoat: 1362.2 },
          },
          {
            heightMm: 2400,
            massKg: 42.45,
            ex: { plainGalv: 953, dipped: 1015.15, powderCoated: 1310.12, plascoat: 1548.2 },
          },
          {
            heightMm: 3000,
            massKg: 53.02,
            ex: { plainGalv: 1188, dipped: 1265.5, powderCoated: 1631.52, plascoat: 1927.2 },
          },
        ],
      },
    ],
  },
];

/** The cheapest configuration anywhere in the table, ex VAT — the basis every
 *  price on the product page is quoted on. */
export const PANEL_FROM_EX_VAT = Math.min(
  ...WIRE_SIZES.flatMap((w) => w.grades.flatMap((g) => g.rows.flatMap((r) => Object.values(r.ex)))),
);
