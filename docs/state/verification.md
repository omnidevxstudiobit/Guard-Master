# Verification workflow — state

## The loop (client-established, follow every batch)
1. **Dev server, never builds, for preview.** Vite dev stays running at `http://localhost:5173/` — the client explicitly asked "make a localhost so u don't again build every time". Run `npx vite build` only as a smoke check before pushing, not for previewing.
2. Verify behavior in a real browser (below), including a screenshot you actually look at.
3. `git add -A && git commit` (descriptive message) && `git push origin main` — push after every verified batch; Vercel deploys from main.

## Headless harness
- `playwright-core` is installed in the session scratchpad (not in the repo) and drives **Edge** at `C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe` (no bundled browsers on this machine).
- Screenshots go to `<scratchpad>/shots/`; write ad-hoc scripts in the scratchpad, never into the repo.
- Collect `console`/`pageerror` events in every script and assert "ERRORS: none".
- The support FAB and other perpetually-animated targets need `evaluate`-clicks or the paused-on-hover state — Playwright refuses "not stable" elements.
- fps probes: count rAF ticks over a timed window while `mouse.wheel` scrolling; this is how every perf claim in [performance.md](performance.md) was measured.

## What "verified" has meant per area (rerun the relevant one after touching)
- **Funnel**: add from grid → badge count → cart totals/VAT-of line → remove line → checkout validation (both collect + deliver branches, bad email/postal rejected) → place order → `GM-YYMMDD-XXXX` ref shown → cart empties.
- **Pricing**: the to-the-cent checks in [pricing-inventory.md](pricing-inventory.md).
- **Panels/PDP**: chip changes move `#price`, `#miniTot`, mobile `#mTotal`; add-to-cart carries the configured ZAR unit.
- **Estimator**: 330 ft walkthrough (34 panels / 35 posts / 544 clamps).
- **Videos**: in-view `[{paused:false,muted:true},…]`, unmute #2 → muted-states `[true,false]`.
- **Maps**: hover a city → info card text swaps.
- **Perf**: scroll fps probe stays ~30, no long tasks from decorative layers.

## Environment quirks
- Windows PowerShell 5.1 primary; Bash tool available. `python -m yt_dlp` (pip) for the client's own social videos. Image crops done with PowerShell System.Drawing (watermark crop = keep left 87% width).
