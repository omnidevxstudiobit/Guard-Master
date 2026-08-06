# Pricing & inventory — state

## The one rule
**ZAR factory data is the source of truth; the display is always USD.** Never hand-type a dollar price. Store/keep ZAR, render through `zar()`. The `/admin/` console keeps this rule: owner price edits are entered in ZAR, and the display rate `settings.rateZarPerUsd` (see [admin.md](admin.md)) only changes conversion, never the stored truth:

- `src/data/products.js`: `ZAR_PER_USD = 16.40` (indicative, dated in a comment — official USD list still owed by client), `zar(n) = '$' + (n/16.40).toFixed(2)` with comma grouping.
- All stored unit prices (product `from`, cart line `unit`, variant matrices after `inclVat`) are **ZAR incl. VAT**.
- `inclVat(ex) = ex × 1.15` — the variant matrices in `variant-prices.js` are ex-VAT factory numbers.
- VAT display line is the *component inside* the total, never added on top: `vatPart(incl) = incl × 0.15 / 1.15` (cartpage.js, checkout.js).

## Catalogue (`src/data/products.js`)
12 products with real ZAR `from` prices, `plain` one-liners, `spec` strings, `options` arrays, `gallery` arrays (first two images drive card + hover-alt), and `pairs` (drives "completes the system" recommendations in cart/checkout). `itemHref(id)` → `/products/item/?p=<id>` unless the product has a dedicated page (`href`).
**Option labels are pricing keys** — renaming a label breaks `resolveUnit` lookups.

## Variant matrix (`src/data/variant-prices.js`)
Recovered from git history (commit `8429f52`, the old TS estimator files) — this is real client pricing, not invented:
- `PANELS`: 96 configs — wire `w3x4`/`w4x4` × security `high`/`medium`/`low` × height `1800–3000` × 4 finishes, ex-VAT. `PANEL_KEYS` maps display labels → matrix keys; `panelUnit()` resolves one panel price.
- `POST_RATES`: per-metre for T-100×60, T-76×40, SQ-76×76 by finish. `POST_LENGTH_MM = {1800:2400, 2100:2700, 2400:3000, 3000:3600}` (post is fence height + planting depth).
- `CLAMPS_PER_PANEL = {1800:16, 2100:20, 2400:24, 3000:28}`.
- `FIXINGS`, `SPIKES`, `COILS` + `COIL_COVER_M`.
- `resolveUnit(p, picks)` — generic: given a product and chosen option labels, returns the ZAR unit or null (null → UI shows "From price · confirmed on order", never a guess).

## Verified-to-the-cent checks (rerun these after touching pricing)
- Default panel (3 m × 1.8 m, high, plain galv): **$77.55** = R1,271.90 incl VAT.
- Posts T-76×40 powder, 3.0 m fence → 3.6 m post: **$29.66** each.
- Estimator at 330 ft: 34 panels, 35 posts, 544 clamps, grand total R57,766.80 rendered in $.
- Cart/checkout funnel: goods $148.10 with "of which VAT" $19.32 (= 148.10 × .15/1.15).

## No inventory system
There is **no stock tracking** — deliberately. The client has no feed, so the site never claims stock levels ("only 3 left" was refused as fabrication). Copy says stock is confirmed by the factory on order.
