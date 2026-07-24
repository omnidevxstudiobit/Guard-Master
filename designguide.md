# Guard Master — Design Guide

> Source: *Guard Master Website Wireframe & Build Brief v1.0*. Every claim below cites its **page + section** in the brief so it can be verified directly.
> Scope: visual design — typography, colour, sections, logo, layout, mobile. Detailed motion rules live in `animationguide.md`.

---

## ⚠️ Two things the brief does NOT specify (do not invent them)

1. **No specific font name is given** — the brief only describes the font's *character* (heavy geometric sans, uppercase headings). The actual typeface must come from the supplied brand assets. *(Page 3, §2 Typography.)*
2. **`--gm-red` is not printed in the brief** — it says *"extract exact hex from supplied SVG."* ✅ **Now resolved:** the brand red is **`#E4112A`** (extracted from the supplied brand reference). The brief itself only prints black `#0A0A0A` and white `#FFFFFF`. *(Page 3, §2 Color system.)*

---

## 1. Typography / Font
**Source: Page 3, §2 "Typography"**

| Property | Specification |
|---|---|
| Style | **Heavy geometric sans** |
| Tracking | **Tight tracking** (reduced letter-spacing) |
| Headings | **UPPERCASE** — matching the wordmark |
| Family | **Single variable font family** |
| Format | **Self-hosted WOFF2** |
| Loading | `font-display: swap` |
| Subset | **Latin subset only** |
| Rule | **No Google Fonts CDN** — self-host for speed + privacy |

> The typeface **name is not specified** — only the style. Source the actual font from the brand assets.

---

## 2. Colour system (tokens)
**Source: Page 3, §2 "Color system"** — hexes for red & grey resolved as noted below.

### Core tokens
| Token | Value | Where / how it's used (per brief) |
|---|---|---|
| `--gm-red` | **`#E4112A`** | Primary CTA fills, accent, active/selected states, "Get a Quote" button, red CTA band, links. **Large type / icons / CTA fills only — never small red body copy** (see §3). |
| `--gm-black` | `#0A0A0A` | Dark section surfaces, hero background. |
| `--gm-white` | `#FFFFFF` | Light section surfaces, text on dark. |
| `--gm-grey-*` | Neutral scale 50–900 (below) | UI chrome, borders, dividers, secondary/tertiary text. |

### Grey scale (`--gm-grey-50 … 900`)
> The brief only says *"Neutral scale, 50–900"* — no hexes. This ramp is **generated as a pure neutral grey (equal R=G=B)**, anchored only to the brief's `--gm-white` `#FFFFFF` and `--gm-black` `#0A0A0A`. **Nothing here is taken from the reference artifact** — the artifact supplied only the red hex.

| Token | Hex | Intended use |
|---|---|---|
| `--gm-grey-50` | `#F7F7F7` | Lightest surface tint; row/hover background on white |
| `--gm-grey-100` | `#EDEDED` | Subtle section background, cards on white |
| `--gm-grey-200` | `#D6D6D6` | Borders & dividers on light surfaces |
| `--gm-grey-300` | `#BABABA` | Strong dividers, input borders, disabled outlines |
| `--gm-grey-400` | `#949494` | Placeholder / disabled text, muted icons (large / UI only) |
| `--gm-grey-500` | `#6E6E6E` | Secondary body text on light (passes AA on white) |
| `--gm-grey-600` | `#525252` | Captions, tertiary / meta text |
| `--gm-grey-700` | `#3A3A3A` | Borders & dividers on dark surfaces |
| `--gm-grey-800` | `#242424` | Dark card / raised surface (a step above `--gm-black`) |
| `--gm-grey-900` | `#161616` | Darkest surface layer, just above `--gm-black` |

---

## 3. Text colour & the red accessibility rule
**Source: Page 3, §2 "Color system" + Accessibility note (same section)**

- **On dark sections:** text = **white** (`--gm-white`).
- **On light sections:** text = **black / grey** (`--gm-black` / `--gm-grey-*`).
- **Secondary text, borders, UI:** **grey scale** (`--gm-grey-*`).
- **Red text is restricted.** Check red-on-white and red-on-black contrast. If red fails **AA** for body text at small sizes → restrict red to **large type, icons, and CTA fills with white text**. **Never use small red body copy.**

---

## 4. Section colours & light/dark interleaving
**The brand works in both inverted (light and dark) modes; alternating them down the page is "a large part of the premium feel."**

### (a) The principle — Source: Page 3, §2 "Color system"
> *"…light and dark sections can be interleaved down the page — **dark hero, light product grid, dark CTA band**, etc. This alternation is a large part of the premium feel."*

### (b) Explicit per-section colours — Source: Page 4, §4.1 "Home Page — section order"
| Section | Colour (as briefed) |
|---|---|
| **Hero** | *"Full-bleed, **dark**"* |
| **Product range grid** | **light** (from the §2 example) |
| **CTA band** | *"**Red**, full-width, single action"* |
| **Header** | *"Sticky, **translucent blur** on scroll"* |
| **"Get a Quote" button** | **red** *(also Page 3, §3)* |

→ Named colours: **Hero = dark/black**, **product grid = light/white**, **CTA band = red**, **Get-a-Quote button = red**. All other sections **alternate** light ↔ dark down the page.

---

## 5. Logo
**Source: Page 2–3, §2 "Logo lockups"**

| Variant | Use case |
|---|---|
| Main Logo (pill-enclosed) | Hero, footer, primary brand moments |
| Text Logo | Secondary contexts, print, wide layouts |
| Sub Main Logo (icon + text) | **Site header / nav bar — default** |
| Icon Logo ("G" mark) | Favicon, app icon, mobile nav, watermark, social avatar |

**Rule:** all four variants must be supplied as **optimized SVG with proper `<title>` elements** for accessibility. **Never use a raster (PNG/JPG) logo.**

---

## 6. Layout / component design
**Source: Page 4, §4.1 (home) + Page 6, §4.2 (product page)**

- **Header:** sticky, translucent blur on scroll.
- **Product range:** **6-card grid — 3×2 desktop / 1 column mobile**; each card is a real `<a>` with photo, H2 name, one-line spec, "Explore."
- **Why Guard Master:** **4 icon cards**.
- **Estimator teaser:** **split layout**.
- **Projects:** **horizontal scroll**, 4–6 cards.
- **SEO content block:** styled as an **editorial section**, not filler.
- **Footer:** **"fat footer"** (product links, resources, locations, company, contact, socials, legal).
- **Product page:** **2-column** — sticky visualiser (left), configurator (right); **finish swatches**; below-fold **CSS/ARIA tabs** (Specification / Installation / Downloads / Warranty / FAQ).

---

## 7. Mobile design
**Source: Page 7, §4.8 "Mobile"** — *mobile-first is non-negotiable.*

- **Configurator stacks:** visualiser on top (sticky, collapsed height); options scroll beneath.
- **Sticky bottom bar** on product pages: current config summary + "Add to Quote."
- **Navigation** = full-screen overlay; only the **icon logo** appears in the bar.
- **Tap targets ≥ 44px.**
- Estimator inputs use `inputmode="numeric"`.

---

## 8. Motion (design-relevant — full rules in `animationguide.md`)
**Source: Page 2, §1 + Page 4, §4.1 + Page 5**

- Design is **priority #3** (after SEO #1, load speed #2): *"Award-worthy, motion-led, premium — but only achieved within constraints 1 and 2."*
- **No motion library on the homepage above the fold — CSS transforms only.**
- **Hero:** priority-loaded poster image (the LCP element) → muted ≤6s video loop swaps in after load; disabled under `prefers-reduced-motion` and save-data.
- **H1:** an **animated kicker line** above it (Page 5).

---

## 9. Accessibility & images
**Source: Page 3, §2 + Page 8, §7.1**

- Red contrast checked against white and black; small red body copy is banned (see §3).
- Logos as SVG with `<title>` (see §5).
- **Every image needs correct, descriptive alt text** — no exceptions, no `alt="image"`.
- Spec/measurement display: **feet first**, e.g. `6 ft (1.8 m)` *(Page 9, §8)*.

---

## 10. Design benchmark
**Source: Page 9, §9 "Competitor Benchmark"**

- **Ameristar** is the stated visual-polish bar — *"Strong brand and imagery. We must match visual polish — this is the design bar."*

---

## 11. Craft & authenticity — no "AI-generated" look
**Project rule (team decision — reinforces the brief's "award-worthy, premium" bar: Page 2 §1 / Page 9 §9).**

- **No AI-generated vibe.** Reject the generic AI-template aesthetic — gratuitous card grids, repetitive bento / over-symmetrical grids, cookie-cutter "hero + 3 cards + CTA" sections. Composition must feel **bespoke, editorial, and premium**, never machine-assembled.
- **Don't over-grid / over-card.** Use a grid only where the content genuinely calls for it — the briefed **6-card product range** is the intended grid; **do not multiply grids/cards elsewhere**. Prefer intentional, sometimes asymmetric, editorial layout.
- **UI, UX & icons must not read as AI-made.** One **consistent, real icon set** (coherent stroke width + style) — no mismatched or generic "AI" icons. Interactions and micro-copy feel hand-crafted.
- **Mobile-first is non-negotiable (reinforces §7).** Any layout or component must work **fully on the phone, at any cost** — if it can't work on mobile, it doesn't ship.
- **Animation** is wired through **Astro island architecture** and must **never** hurt DOM / LCP / FCP / speed — see `animationguide.md`.

---

## Quick reference

- **Font:** heavy geometric sans, variable, self-hosted WOFF2, uppercase + tight-tracking headings. *(name TBD from assets)*
- **Colours:** red `#E4112A`, black `#0A0A0A`, white `#FFFFFF`, neutral grey scale `#F7F7F7 … #161616` (50–900, see §2).
- **Sections:** alternate light/dark; hero dark, product grid light, CTA band red.
- **Red:** CTAs, accents, active states, icons, large type only — never small body text.
- **Logo:** SVG only, four variants; header uses Sub Main Logo, mobile bar uses Icon ("G").
- **Mobile-first**, tap targets ≥44px, no above-the-fold motion library.
- **Craft (§11):** no AI-generated look; bespoke layout + one real icon set; motion via Astro islands; every layout/animation must work on mobile.
