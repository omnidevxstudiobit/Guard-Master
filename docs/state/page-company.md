# Company page (/us/) — state

`us/index.html` + `src/js/us.js`.

## Section order
Hero "An American company with its own factory." with the Liberty silhouette backdrop (`.lady`, original vector) and Call/email CTAs → **SA proving-ground dot map** (#saMap + #cityInfo) → supply-line arc card Benoni → Fort Lauderdale (dashed arc, ship marker, labels) → **US welcome section** "America, please welcome us." (#usMap + #usInfo) → Why-buy cards (proven / factory-direct / spec) → CTA card → slim footer with both phone numbers.

## The maps (one shared builder)
`buildMap({hostId, infoId, W, H, step, outline, hole, cities})` in us.js:
- Fills a normalised hand-drawn `outline` polygon with a dot grid via ray-cast point-in-polygon (`inside()`, optional elliptical `hole` — used for Lesotho).
- Cities are absolutely-positioned `<button class="city">` markers (`.city--home` pulses); info card follows **click, pointerover, and focusin**, with `aria-pressed` tracking and `aria-live` on the card. `show(0)` seeds the card with the home city.
- **SA map**: 760×600, step .021, Lesotho hole, 10 cities, home = Benoni ("the factory"). City copy attributes deliveries honestly (sister-company record, see [content-rules.md](content-rules.md)).
- **US map**: 760×360, step .02, 37-point continental outline (recognisable Florida/Texas/Maine), 8 cities — home = **Fort Lauderdale, Guard Master US head office**; the rest (NYC, Chicago, Dallas, LA, Seattle, Denver, Atlanta) are explicitly "shipping destination" copy, never past projects.

## Positioning rules embodied here
US company that owns the SA factory; SA record = proving ground; welcome copy near-verbatim from the client: "We manufacture in South Africa and distribute all over the world — and now the US is home."

## Tests (verified)
- Hover Dallas → info card swaps to "Dallas / Texas perimeters are exactly what 358 mesh was made for." (same probe works for any city).
- Both maps render their dot grids and markers with zero console errors; keyboard focus moves the card.
- Screenshots eyeballed: both silhouettes read as their countries (SA earlier, US in `shots/us-map.png`).

## Notes
- Silhouettes are stylised originals (hand-plotted), not traced GeoJSON — edit outline points by nudging normalised coords and re-screenshotting.
- The Liberty vector is an original drawing of a public-domain monument.
