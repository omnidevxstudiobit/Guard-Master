# Policies page — state

`policies/index.html` + `src/js/policies.js` (chrome only — `initCart()` and nothing else; keep it that way, this page must be dead simple).

## Content
- Warranty table by finish (Plascoat carries the 10-year warranty; other finishes shorter, per factory data).
- Delivery/collection, payment-on-confirmation, and returns copy consistent with the checkout honesty line.
- **Draft-flagged**: the page visibly notes the policies await client sign-off. Do not remove the flag until the client approves the text — see [content-rules.md](content-rules.md).

## Tests
- Page loads with shared chrome (nav, curtain, fence footer) and zero console errors. No interactive logic to test.
