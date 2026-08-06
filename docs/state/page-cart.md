# Cart page — state

`cart/index.html` + `src/js/cartpage.js`.

## Standard implementation
- **Deck**: every gallery image of every ordered product becomes a swipeable card (price badge, title, spec). Front card draggable (release past 28 % of deck width advances), arrows + ←/→ keys, dots + `01 / NN` index, auto-advance every **3.2 s** — paused on hover, on drag, when the tab is hidden, and entirely under `prefers-reduced-motion`. Cards beyond depth 3 are hidden (reference stacks four).
- Frames rebuild from the order (`cartStore.read()`), falling back to the line's own `img` when the product id can't be matched.
- **Order panel**: lines with thumb, `$… each · ×qty`, amount, remove button; Clear-cart button; totals show Goods, **"of which VAT (15%)"** = `goods × .15/1.15`, Total (VAT is inside the price, never added — see [pricing-inventory.md](pricing-inventory.md)).
- **Recommendations**: union of `pairs` of everything in the order, minus what's already there, first 3 — rendered with Add buttons that update in place.
- Empty state: deck hidden, "Nothing added yet", link to the catalogue, totals hidden.

## Tests (verified, part of the end-to-end funnel)
- Two-line order: goods **$148.10**, VAT-of line **$19.32**, badge and `#lineCount` agree with units.
- Remove line → totals, deck frames, and nav badge all update; removing the last line lands the empty state.
- Recs only show products *not* in the order; adding one moves it out of recs and into the lines.
- Auto-advance stops on pointerenter and on tab hide; drag past threshold flings the card, under threshold it settles back.
