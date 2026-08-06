# Quote estimator — state

`estimate/index.html` + `src/js/estimate.js`. The brief's centrepiece conversion tool; the nav's red "Get a quote" lands here.

## Standard implementation
- **6 steps**: perimeter length (feet, US-first) → height → security level/wire → finish → toppings/extras → contact/BOM.
- Math (all from `variant-prices.js`, no invented numbers):
  - feet → metres, `panels = ceil(m / 3)` (3 m panel), `posts = panels + 1`
  - `clamps = panels × CLAMPS_PER_PANEL[height]` ({1800:16, 2100:20, 2400:24, 3000:28})
  - post cost = per-metre rate (`POST_RATE_FOR` by profile+finish) × `POST_LENGTH_MM[height]`
  - spikes via `SPIKE_FOR` finish map; coils by `COIL_COVER_M` coverage
- Output: itemised BOM lines (each `zar()`-rendered) with quantities and a grand total; mailto action carries the BOM so the enquiry is self-describing.
- The estimate is labelled indicative — freight and final pricing confirmed by the factory.

## Tests (verified to the cent)
330 ft walkthrough → 100.58 m → **34 panels, 35 posts, 544 clamps** (34 × 16 at 1.8 m); grand total R57,766.80 rendered in $ via the 16.40 conversion. Rerun this exact walkthrough after touching estimator math, `variant-prices.js`, or `zar()`.

## Open items
- Monday.com webhook owed by client — submissions are mailto-only until then.
- Official USD price list will replace the conversion (single-point change: `ZAR_PER_USD` / `zar()`).
