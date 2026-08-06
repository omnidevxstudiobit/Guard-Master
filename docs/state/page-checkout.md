# Checkout page — state

`checkout/index.html` + `src/js/checkout.js`.

## Standard implementation
- Summary panel re-renders from `cartStore`: lines, Goods, "of which VAT (15%)" (`goods × .15/1.15`), fulfilment line (Delivery "Quoted on dispatch" / Collection "Free"), Total. Place-order button label carries the total; disabled + dimmed when the cart is empty.
- **Collect vs deliver** radio (`name="fulfil"`): choosing deliver reveals `#addrStep` and renumbers the site step (`#nSite` 3→4); the summary's fulfilment line follows.
- **Validation** (`RULES` map, per-field `data-err` slots, `aria-invalid`):
  name ≥2 chars · email `/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/` · phone ≥9 digits · and when delivering: street ≥4, city ≥2, province required, postal `/^\d{4}$/` ("South African postal codes are 4 digits"). Submit focuses + scrolls to the first error; errors clear live as a field becomes valid.
- **Placing the order**: ref `GM-<YYMMDD>-<4-digit rand>`; full order object (customer, address when delivering, lines, goods) saved to `sessionStorage.gm_last_order` (comment marks where a real POST goes); cart cleared; confirmation card renders with the ref, first name, email echo, total incl. VAT, item count, and **the honesty line "Nothing has been charged — payment is arranged with the factory on confirmation."** Recommendations from `pairs` ("Others on this system usually add") + keep-shopping/call CTAs.

## Tests (verified end-to-end)
- Both branches: collect (3 fields) and deliver (7 fields) — bad email and 5-digit postal rejected with inline messages, first invalid field focused.
- Valid submit produced ref `GM-260806-6986`, cart badge reset to 0, totals matched the cart page ($148.10 / VAT-of $19.32).
- Empty-cart state disables the button with "Nothing to order".

## Admin integration (added 2026-08-06 — see [admin.md](admin.md))
- **Promo codes**: `#promo` field validated against `/admin/` discounts; percent capped 0–100, amount codes never take the total below zero; VAT-inside computed on the **discounted** total; discount recorded on the order. Verified: SAVE10 on R1500 → Goods $91.46 / −$9.15 / VAT $10.74 / Total $82.32.
- **Order log + webhooks**: placing an order appends to `localStorage.gm_orders` and fires `orders/create` webhooks (browser POST, best-effort — a dead endpoint never blocks the confirmation). Verified against a local receiver.
- **Settings**: fulfilment options can be switched off from admin (never both), plus an owner note under the totals.

## Open items
- No backend: order POST target + payment flow are pending client infrastructure (webhooks → Zapier/Make/Monday.com is the interim path for durable order capture — see [admin.md](admin.md)). The delivery-address rules are SA-format; if US checkout addresses are ever needed, RULES (postal/province) must fork by country.
