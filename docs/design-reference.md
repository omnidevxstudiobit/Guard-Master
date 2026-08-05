# Guard Master — design reference

Working document. Captures what we decided, what we observed on the reference
site, and the image brief. Nothing here is built yet.

Reference site: **quietcubes.com** (marketing) + **configurator.quietcubes.com** (commerce)

---

## 1. Home page categories — DECIDED

Four pills, split by **who it's for**, not by component. A homeowner does not
shop for "a post"; they shop for "a fence for my house".

| Pill | Contains | Entry price |
|---|---|---|
| **Home & Estate** | Vista range, Clear View panels, posts, solar caps, hinges | From R184,00 |
| **Commercial & Industrial** | Clear View 358 panels, posts, spider clamps, spikes | From R8,06 |
| **High Security** | Razor wire mesh, concertina coils, flat wrap, razor posts | From R108,10 |
| **Gates & Entrances** | Sliding, swing, pedestrian gates, gate hinges | From R184,00 |

Four is the ceiling — the pills are large (product photo protruding from the
left end), and five wrap on a laptop.

**Component split stays** on `/products/` (Clear View / Razor wire /
Accessories). Same as the reference: pills by application, catalogue by
component.

**Open:** Temporary fencing is excluded — it is the only line with no published
price, and we ruled out "factory quote" everywhere. Either get the price and it
becomes a fifth pill, or it lives in the catalogue only.

---

## 2. Reference site — structure

Two separate products, deliberately opposite:

- **Marketing site** — pure black, long scroll, brochure. Every category link is
  `href="#"`; categories swap **in place**.
- **Configurator** — flips to **light grey**. Conventional, scrollable, this is
  where money changes hands.

> The brochure is a scene. The shop is a document.

That split resolves our light/dark question: **commerce stays light.**

### Page order (marketing)

1. Black gateway — logo, "Select Your Pod", 4 pills, tagline
2. Hero — category-tinted gradient field, product render, right-aligned tagline
3. Size/variant range — "Quiet Spaces Built for 1 to 10 Minds"
4. Press — "As featured by **Forbes**" + pull quote
5. Captioned video, playing inline
6. "Crafted With Technology" — feature list
7. Materials — **exploded swatch fan** beside the product (light ground)
8. "Crafted with Care" marquee — sand/beige, leaf icons between repeats
9. **99% recyclable** — full-bleed landscape photo, copy laid on the sky
10. Process — 5 steps, **descending diagonal staircase**
11. Client stories — layered portrait collage behind/in front of the headline
12. Testimonials — named, with real roles and institutions
13. FAQ — tabbed (General / Shipping & Delivery)
14. Closing CTA — "Your Pod Is Just a Click Away"
15. Footer — category links each in **their own category colour**

### Category page (e.g. Home Pods)

- Heading + the 4 pills presented **as content**, then they stick to the nav
- Colour/finish variants as a **horizontal filmstrip** — active one lit, others
  dimmed to near-black, colour name labelled in the accent (Navy / Teal / Nut)
- Section content **re-renders per category** — the 99% valley scene shows arch
  home pods instead of office cubes

---

## 3. Transitions and effects (observed)

| Effect | Where | Notes |
|---|---|---|
| Damped / inertial scroll | whole page | content lags the wheel, eases in |
| Pinned hero | gateway | holds while the scrollbar keeps travelling |
| **Curved arc field → vertical slat retract** | hero | the coloured field has a shallow arc top edge, then breaks into uneven vertical bars that pull back to reveal black |
| **Scroll-linked parallax stagger** | process staircase | each column drifts at its own rate — the diagonal is built by scroll offset, not layout |
| **Split-band parallax** | between sections | two full-width image bands scrolling at different rates |
| Infinite marquee | "Crafted with Care" | icon in a circle between repeats |
| Sticky nav reveal | after hero | pills move from content into the nav bar |
| Page tint follows category | everywhere | active pill sets the accent for the whole page |
| Layered collage | testimonial intro | portraits at varied scale, some behind the headline, some in front |
| Captioned inline video | client stories | burned-in subtitles, works muted |

### Not yet observed
- What clicking a pill actually animates (re-tint? cross-fade? reload?)
- The "Turn off/on" toggle in the technology section
- FAQ tab behaviour, testimonial carousel, WATCH VIDEO modal
- Hover states, mobile

---

## 4. What we take / what we skip

**Take**
- Persistent category pills as the spine; page tints to the active one
- Background colour changing per section (black → tint → sand → photo → light)
- Full-bleed photography with copy laid directly on it, no card
- The descending staircase process, with scroll-linked drift
- Finish variants as a horizontal filmstrip, active lit / others dimmed
- Materials as an exploded fan of swatches
- Marquee band with icon separators
- Footer links coloured per category

**Skip**
- The black gateway splash — costs a click before anyone sees a product.
  Justifiable at $8,625 a pod; not at R8,06 a clamp.
- Scroll hijacking. Get the damped feel with `position: sticky` +
  scroll-linked animation so `End`, deep links and SEO keep working.
  (Their `End` key lands on a blank black screen — that is a real bug.)
- Anonymous or invented testimonials. We use real ones or none.

---

## 5. Palette

Ours stays **mostly white** (decided earlier). Category accents replace their
per-pod gradients:

```
ground      #ffffff / #f7f8f6      the site is a white site
ink         #14121a                violet-biased near-black
muted       #6f6a78
yellow      #f9e21b                CTA only  — 1.32:1 on white, FILL ONLY, black text
purple      #762ce5                badge/link — 6.44:1 on white, white text only
```

### Category accents — DECIDED

One per pill. Used for: pill fill (white label on top), section wash, footer
link, and the active state on that category's pages. All four carry white text
well clear of AA 4.5:1.

| Category | Hex | White text | Why |
|---|---|---|---|
| Home & Estate | `#2E5E45` | 7.49:1 | Garden green — hedges, lawns, domestic calm |
| Commercial & Industrial | `#25445F` | 10.14:1 | Steel navy — galvanised, corporate |
| High Security | `#8C2B20` | 8.46:1 | Oxide red — threat, without fire-engine alarm |
| Gates & Entrances | `#6B4A2A` | 7.96:1 | Bronze umber — hardware, movement |

All four are dark and low-to-mid saturation on purpose: on a white site they
read as considered rather than toy-like, and none of them competes with the
CTA yellow, which stays the only bright thing on the page.

**Caveat to watch:** oxide red (hue 6°) and bronze umber (hue 29°) are the
tightest pair at 23° apart. They separate on saturation and lightness, but if
they read too similar in situ, push bronze to a deeper espresso or swap Gates
to a graphite slate.

Yellow `#f9e21b` sits at hue 54° / 95% saturation — far from all four, so it
still pops as the single action colour.

---

## 5b. Page structure — DECIDED

We invert the reference. They put the story first and push commerce to a
separate subdomain. We put **the buy first and the story underneath**, on the
same page.

```
HOME                    4 pills, category-tinted
  └─ click a pill
       CATEGORY PAGE
         ├─ TOP:  the calm buy         ← low motion, no parallax
         │        every product in that category, priced,
         │        straight to add-to-cart. Someone who knows
         │        what they want never has to scroll.
         │
         └─ BELOW: the designed page   ← full motion
                  hero scene, finish filmstrip, materials,
                  process staircase, marquee, FAQ
                  For the buyer who needs convincing.

  └─ click a product
       PRODUCT PAGE   ← reuse /products/clear-view-panels/ as the template
                        gallery + guided pick + configurator + wipe
```

**Why this order.** Motion sells to someone who is browsing and costs time for
someone who is buying. Putting the calm grid at the top serves both without
making either compromise. It also means the heavy scroll-linked work is below
the fold, so it never delays first paint.

**Motion budget for the top section:** fade-in on load only. No parallax, no
pinning, no scroll-linked transforms. The only movement is hover on a card and
the cart morph.

---

## 6. Image brief — Home & Estate

Stock and the existing photography are not strong enough for the hero moments.
These are for AI generation. All must read as **South African residential**, and
as **Clear View 358 anti-climb mesh** — not chain-link, not palisade, not razor.

### What I need — 13 images, in priority order

**Tier 1 — the calm buy section. Without these the page cannot be built.**

| # | Image | Ratio | Where |
|---|---|---|---|
| 1 | Pill thumbnail | 1:1 800px | Home page pill |
| 2 | Category header | 21:9 2400px | Top of category page, behind the title |
| 3–6 | Product cards ×4 — Vista panel, Clear View panel, capped post, solar cap | 4:3 1200px | The buy grid |

**Tier 2 — the designed section below.**

| # | Image | Ratio | Where |
|---|---|---|---|
| 7 | Hero, home at dusk | 16:9 2400px | Story hero |
| 8 | Lifestyle, from inside the garden | 3:2 2000px | Sightline proof |
| 9 | Wide landscape, empty upper third | 21:9 3000px | Overlaid stat/copy |

**Tier 3 — the finish filmstrip. Four images, identical framing.**

| # | Image | Ratio |
|---|---|---|
| 10–13 | Plain galvanised · Hot-dip galvanised · Powder coated black · Plascoat green | 4:5 1600px |

Filmstrip framing must be **pixel-identical** across all four — the dim/lit
transition only works if nothing but the finish changes between frames.

### Getting the mesh right (include in every prompt)

> welded steel mesh fence panel, very narrow horizontal apertures 76mm wide by
> 12.7mm high, vertical wires spaced widely, horizontal wires packed close
> together so the mesh reads as fine dense lines, 4mm wire, see-through, no
> barbs, no razor wire, no chain-link diamond pattern, square capped posts every
> 3 metres

### 6.0a — Category header (Tier 1, #2)

Calm, wide, quiet. This sits behind the category title at the top of the buy
section, so it must not fight text and must not be busy.

> Wide calm architectural photograph, early morning soft overcast light. A clean
> straight run of dark grey powder-coated Clear View 358 anti-climb mesh fencing
> along a suburban South African boundary, viewed straight on from a low angle.
> Welded steel mesh, very narrow horizontal apertures 76mm × 12.7mm, vertical
> wires widely spaced, horizontal wires packed close so the mesh reads as fine
> dense lines, square capped posts every 3 metres, see-through, no barbs, no
> razor wire, no chain-link. Simple mown lawn below, soft out-of-focus green
> hedge behind. Muted desaturated palette, generous empty sky. Photoreal,
> minimal, nothing cluttered.
> **21:9, 2400px+.**

### 6.0b — Product cards (Tier 1, #3–6)

Same studio treatment for all four so the grid is even. Swap only the subject.

> Studio product photograph on a seamless very light grey background,
> three-quarter view, soft even light from the upper left, subtle contact shadow.
> Subject: **{a Clear View 358 anti-climb mesh fence panel, dark powder-coated |
> a slimmer lighter-gauge residential mesh fence panel | a square capped steel
> fence post, dark powder-coated | a black solar-powered fence post cap with a
> horizontal light strip}**. Mesh must read as fine dense horizontal wires and be
> clearly see-through. Photoreal, no props, no text, no watermark, centred with
> even margins.
> **4:3, 1200px.**

### 6.1 — Hero (widest, most important)

> Cinematic architectural photograph of a modern South African home at dusk,
> shot from the street. A tall dark-grey powder-coated Clear View 358 anti-climb
> mesh fence runs across the full foreground — welded steel mesh with very narrow
> horizontal apertures 76mm × 12.7mm, vertical wires widely spaced, horizontal
> wires packed close so the mesh reads as fine dense lines, square capped posts
> every 3 metres, completely see-through, no barbs, no razor wire, no chain-link.
> Behind the fence: warm interior lights, a lit garden, established planting.
> Deep blue twilight sky, last warm light on the horizon. Low warm garden uplights
> grazing the fence. Ultra-sharp, 35mm, f/4, natural colour, no HDR, no lens
> flare, photoreal, premium real-estate photography.
> **16:9, at least 2400px wide.**

### 6.2 — Pill thumbnail (square, tight)

> Square crop, three-quarter view of a dark powder-coated Clear View 358
> anti-climb mesh fence panel with a square capped post, in front of a softly
> blurred green suburban garden at golden hour. Mesh sharp and clearly
> see-through with fine dense horizontal wires. Shallow depth of field.
> Photoreal, clean, no text, no watermark.
> **1:1, 800px.**

### 6.3 — Lifestyle / in-use

> A family garden behind a 1.8m dark grey Clear View 358 anti-climb mesh fence,
> photographed from inside the garden looking out. The mesh is fully transparent
> — the street and neighbouring trees are clearly visible through it. Late
> afternoon sun, long soft shadows across a lawn. Warm, safe, calm. No people's
> faces in focus. Photoreal, natural colour.
> **3:2 landscape.**

### 6.4 — Wide landscape scene (the "99%" equivalent)

> Wide cinematic landscape, South African highveld at golden hour, rolling green
> hills and a distant mountain ridge. A single clean run of dark Clear View 358
> anti-climb mesh fencing crosses the middle distance, following the contour of
> the land. Enormous sky with generous empty space in the upper third for
> overlaid text. Photoreal, no people, no buildings, no razor wire.
> **21:9, at least 3000px wide.**

### 6.5 — Finish filmstrip (one per finish, identical framing)

Same crop and lighting each time, only the finish changes — they sit side by
side in the filmstrip.

> Studio product photograph on a seamless light grey background, three-quarter
> view of a Clear View 358 anti-climb mesh fence panel with a square capped post.
> Finish: **{Plain Galvanised, bright zinc | Hot-Dip Galvanised, matte silver
> spangle | Powder Coated, matte black | Plascoat, satin dark green}**. Soft
> even studio light, subtle floor shadow. Mesh clearly see-through with fine
> dense horizontal wires. Photoreal, no props, no text.
> **4:5 portrait, 1600px.**

### House rules for every image
- Landscape and planting must read as South African, not European or American
- Never generate razor wire, barbed wire or spikes in Home & Estate
- No visible brand marks or text
- No people in sharp focus (avoids likeness issues)
- Deliver WebP; hero at 2400px+, cards at 800–1200px

---

## 7. Decisions still open

1. The four category accent colours
2. Temporary fencing — price, or catalogue-only
3. Real testimonials / press — do any exist? Nothing invented.
4. Delivery pricing — flat, per province, or collection-only
