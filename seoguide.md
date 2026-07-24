# Guard Master — SEO Guide

> Source: *Guard Master Website Wireframe & Build Brief v1.0*. Every rule cites its **page + section** so it can be verified against the PDF.
> **SEO is priority #1** on this project — *"Organic ranking is the commercial engine. Design serves SEO, never the reverse."* (Page 2, §1). This section of the brief "carries equal weight to the design spec" (Page 8, §7).

---

## 0. The rule that governs everything
**Source: Page 2, §1 + Page 8, §7.4**

- **Server-rendered, static-first (SSG/ISR):** HTML and copy exist in the DOM **before any JavaScript runs**. *"Server-rendered HTML for all content — nothing that matters may require JS to appear."*
- **Progressive enhancement:** if JS fails, the site is still **complete, readable, and indexable**.
- Everything below assumes content is in the crawlable HTML, never JS-injected.

---

## 1. Heading hierarchy (H1 / H2 / H3)
**Source: Page 8, §7.2 + Page 4, §4.1 + Page 5, §4.2**

**Rules:**
- **Exactly one `<h1>` per page**, containing the page's **primary keyword**.
- **Logical H2 → H3 descent** — no skipped levels, structure reflects content outline.
- Headings are real DOM text (not images, not JS-injected).

**Per-page heading pattern:**

| Page | H1 (primary keyword) | H2s | H3s |
|---|---|---|---|
| **Home** | *"The Industry Standard in Clear View Security Fencing."* (Option 1 — carries the primary keyword; the *"See Through It…"* kicker above it is an **animated line, not an H1**) | Product range · Choose your security level · Why Guard Master · Quote estimator · Projects · **SEO content block** · FAQ | Sub-topics inside the SEO block (what clear-view fencing is · 358 mesh explained · applications · finishes · US shipping) |
| **Product (Panels/Posts)** | Product name + keyword, e.g. *"Clear View Panels (358 Mesh)"* | Specification · Installation · Downloads · Warranty · FAQ · Complete the system · long-form copy | Spec sub-sections, FAQ questions |
| **Guides** (`/guides/*`) | Guide title with target keyword, e.g. *"What Is 358 Mesh Fencing?"* | Logical article sections | Sub-points |
| **Warranties** | Warranty-focused H1 (rank for *"fence warranty"*) | Coverage by finish · What's covered · What voids it · Claim process | — |
| **Locations** (`/locations/[state]`) | Geo + keyword, e.g. *"Security Fencing in Texas"* | Regional content sections | — |

- H1 strategy (Page 5): **the search engine gets the keyword phrase (H1); the human gets the hook (animated kicker above it).**

---

## 2. Title tags & meta descriptions
**Source: Page 8, §7.2**

- **Unique `<title>` per page — 50–60 characters.**
- **Unique meta description per page — 150–160 characters.**
- Both must be **CMS-editable** (ops can change without a deploy).
- Include the page's primary keyword naturally.

---

## 3. URLs
**Source: Page 8, §7.2 + Page 3, §3**

- **Clean, semantic URLs** — e.g. `/clear-view-fencing-panels`, `/358-security-mesh`. **Never** `/product?id=42`.
- Content routes (examples): `/guides/*`, `/compare/*`, `/locations/*`.
- **robots.txt:** allow all; **block only search/filter parameter URLs** (Page 8, §7.4).

---

## 4. Canonical tags
**Source: Page 8, §7.2**

- **Canonical on every page.**
- **Self-referencing by default.**
- **Configurator variants canonical to the parent product** (option combinations must not create duplicate indexable URLs).

---

## 5. Structured data (JSON-LD)
**Source: Page 8, §7.3**

| Schema | Where |
|---|---|
| **Organization** + **LocalBusiness** | Site-wide |
| **Product** (with **Offer** + **AggregateRating**) | Product pages |
| **FAQPage** | Home + product FAQs |
| **BreadcrumbList** | All inner pages (see §6) |
| **Article** | Guides (`/guides/*`) |
| **VideoObject** | Any page with video content |

- FAQ answers must be **real HTML in the DOM at all times, never JS-injected** (Page 4, §4.1) — required for FAQPage schema validity.

---

## 6. Internal linking & breadcrumbs
**Source: Page 8, §7.2 + Page 3, §3 + Page 7, §4.7**

- **Breadcrumbs on all inner pages**, with **BreadcrumbList** schema. e.g. `Home › Products › Clear View Panels`.
- **Internal linking (mandatory):** every product page links to **related products**, **relevant projects**, and **at least one guide**.
- **Top nav = six product/content items + red "Get a Quote"**; everything else lives in the **"fat footer"** — deliberately for internal link equity.
- **Projects/case studies** link back to the configured product — a strong internal-linking asset.

---

## 7. XML sitemap & robots
**Source: Page 8, §7.4**

- **XML sitemap** — auto-generated, **submitted to Google Search Console**.
- **robots.txt** — allow all crawling; **block only search/filter parameter URLs**.

---

## 8. Migration — the 301 redirect map ⚠️
**Source: Page 8, §7.4 — flagged as the single largest project risk**

- Build a **301 redirect map for every existing URL** on **fencing-supplier.com**.
- **Do NOT launch without it** — *"losing current rankings on migration is the single largest risk to the project."*

---

## 9. Performance = ranking (technical SEO)
**Source: Page 2, §1 + Page 8, §7.4**

- **Sub-2-second LCP on 4G mobile.** Motion must never delay first paint.
- **HTTPS, HTTP/3, Brotli compression, long-cache static assets.**
- Heavy interactive elements (configurator, estimator) **code-split, lazy-mounted below the fold, never on the critical path.**
- Mobile-first — majority of US search traffic is mobile (Page 7, §4.8).

---

## 10. Content layer — the ranking engine
**Source: Page 8–9, §7.5**

Pages built to beat Master Halco, Ameristar, Gibraltar:

- `/guides/what-is-358-mesh-fencing`
- `/guides/anti-climb-fence-height-guide`
- `/guides/clear-view-vs-chain-link`
- `/guides/perimeter-security-for-solar-farms`
- `/guides/fence-finishes-galvanised-vs-powder-vs-plascoat`
- `/compare/guard-master-vs-[competitor]` — one per major competitor
- `/locations/[state]` — see §11

**Rules:** target **1,500+ words each**, original and genuinely useful, **internally linked to products**. Copy is a **content-writer deliverable, not dev** — but the **CMS templates must be ready** for it.

**On-page long-form content already required:**
- **Homepage SEO content block:** 800–1,200 words of real prose, H2/H3 structured (Page 4, §4.1).
- **Product pages:** 600+ words of genuinely useful long-form copy (Page 6, §4.2).
- **Warranties page:** content-heavy, schema-marked, built to rank for *"fence warranty"* long-tail (Page 7, §4.6).

---

## 11. Localisation SEO (US market)
**Source: Page 9, §8**

- **Units:** imperial primary, metric in parentheses — `6 ft (1.8 m)` — everywhere (specs, estimator, guides).
- **Currency USD**; **US English spelling** in customer-facing copy (*"galvanized"*, not *"galvanised"*).
- **US-format phone**, toll-free if available.
- **Continental-US shipping / lead-time** shown prominently (top objection against a foreign manufacturer).
- **State/metro landing pages** (`/locations/texas`, `/locations/california`, …) with **genuinely localised content** — regional projects, applicable codes, wind/corrosion considerations. **Thin duplicate location pages will be penalised — do them properly or not at all.**
- **Compliance signals:** ASTM references, ISO certification, and a clear **Buy American / domestic-content** statement.
- **hreflang** if a South Africa version is served: **`en-US`** and **`en-ZA`** (Page 8, §7.4).

---

## 12. Carry over from the existing site (don't lose what already ranks)
**Source: Page 8, §7.1**

- **Substantial indexable text on the homepage** (the SEO content block).
- **Correct, descriptive alt text on every single image** — no exceptions, **no `alt="image"`**.
- **Every product listed in Google Merchant Center and Google Ads.**

---

## Per-page SEO checklist (quick reference)

- [ ] One `<h1>` with the primary keyword; logical H2/H3 descent
- [ ] Unique `<title>` (50–60 chars) + meta description (150–160 chars), CMS-editable
- [ ] Clean semantic URL
- [ ] Self-referencing canonical (variants → parent)
- [ ] Relevant JSON-LD (Organization/LocalBusiness site-wide; Product/FAQPage/BreadcrumbList/Article/VideoObject as applicable)
- [ ] Breadcrumbs with BreadcrumbList schema (inner pages)
- [ ] Internal links: related products + projects + ≥1 guide (product pages)
- [ ] All content server-rendered in the DOM (no JS-injected copy)
- [ ] Descriptive alt text on every image
- [ ] Imperial-first units, US English, USD
- [ ] In XML sitemap; parameter URLs blocked in robots.txt
- [ ] 301 redirect from the old URL (migration)
- [ ] Sub-2s LCP on 4G mobile

---

## Appendix A — Title & meta description examples (per page type)
> Ready-to-adapt strings. **`<title>` target 50–60 chars, meta description 150–160 chars** (§2). All in **US English** (`galvanized`), imperial-first. Char counts are approximate — verify final length. Brand/domain uses the placeholder `guardmasterfencing.com`.

| Page | `<title>` | Meta description |
|---|---|---|
| **Home** | `Clear View 358 High-Security Fencing \| Guard Master` *(~51)* | `The US industry standard in clear view 358 anti-climb security fencing. Manufacturer-direct panels, posts & fixings, 10-year warranty. US shipping. Get a quote.` *(~159)* |
| **Product — Panels** | `Clear View 358 Mesh Security Fence Panels \| Guard Master` *(~56)* | `Configure clear view 358 mesh fence panels — aperture, panel size, wire gauge & finish. Anti-climb, galvanized to Plascoat, 10-yr warranty. Add to quote.` *(~153)* |
| **Guide** | `What Is 358 Mesh Fencing? Specs & Uses \| Guard Master` *(~53)* | `358 mesh fencing explained: apertures, wire gauge, anti-climb security ratings, finishes, and where to use it — a practical guide from the manufacturer.` *(~151)* |
| **Location** | `Clear View Security Fencing in Texas \| Guard Master` *(~51)* | `Clear view 358 security fencing across Texas — commercial, industrial, solar & government perimeters. Manufacturer-direct, US shipping, ASTM & ISO. Get a quote.` *(~159)* |

**Rules:** one keyword-led title per page; never duplicate titles/descriptions across pages; front-load the primary keyword; keep them CMS-editable (§2).

---

## Appendix B — JSON-LD templates (copy-paste)
> Place each in a server-rendered `<script type="application/ld+json">` in the page `<head>` — **never JS-injected** (§0, §5). Schema content **must match the visible on-page content**. Replace `…` placeholders. Domain shown is the placeholder from `astro.config.mjs`.

### B1 · Organization + LocalBusiness — site-wide (§5)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://www.guardmasterfencing.com/#org",
      "name": "Guard Master",
      "legalName": "Wire Ventures CC t/a Guard Master Fencing Solutions",
      "url": "https://www.guardmasterfencing.com",
      "logo": "https://www.guardmasterfencing.com/logo.svg",
      "description": "Manufacturer-direct premium clear view 358 anti-climb high-security perimeter fencing.",
      "sameAs": ["https://www.linkedin.com/company/…", "https://www.facebook.com/…"]
    },
    {
      "@type": "LocalBusiness",
      "@id": "https://www.guardmasterfencing.com/#business",
      "name": "Guard Master",
      "url": "https://www.guardmasterfencing.com",
      "image": "https://www.guardmasterfencing.com/og-image.jpg",
      "telephone": "+1-…-…-…",
      "priceRange": "$$",
      "areaServed": "US",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "…",
        "addressLocality": "…",
        "addressRegion": "…",
        "postalCode": "…",
        "addressCountry": "US"
      }
    }
  ]
}
</script>
```

### B2 · Product — product pages (§5)
> Pricing is a **range, never a fixed price** (business rule) → use **`AggregateOffer`** with `lowPrice`/`highPrice`. Include **`AggregateRating` only with genuine reviews** — never fabricate ratings.
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Clear View Panels (358 Mesh)",
  "sku": "CVP-358",
  "image": ["https://www.guardmasterfencing.com/products/clear-view-panels.jpg"],
  "description": "High-security anti-climb 358 mesh fence panels — 76×12.7 mm aperture, galvanized to Plascoat finishes, 10-year warranty.",
  "brand": { "@type": "Brand", "name": "Guard Master" },
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "…",
    "highPrice": "…",
    "offerCount": "…",
    "availability": "https://schema.org/InStock",
    "url": "https://www.guardmasterfencing.com/clear-view-fencing-panels"
  }
}
</script>
```

### B3 · FAQPage — home + product FAQs (§5)
> Each `text` must be **identical to the answer already in the DOM** (answers are never JS-injected — §0).
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is 358 mesh fencing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "358 mesh is a welded steel mesh with 76 × 12.7 mm (3\" × 0.5\") apertures — too small for fingers or tools, making it anti-climb and anti-cut."
      }
    },
    {
      "@type": "Question",
      "name": "Do you ship across the United States?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — we ship nationwide across the continental US, direct from the manufacturer."
      }
    }
  ]
}
</script>
```

### B4 · BreadcrumbList — all inner pages (§6)
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.guardmasterfencing.com/" },
    { "@type": "ListItem", "position": 2, "name": "Products", "item": "https://www.guardmasterfencing.com/products" },
    { "@type": "ListItem", "position": 3, "name": "Clear View Panels", "item": "https://www.guardmasterfencing.com/clear-view-fencing-panels" }
  ]
}
</script>
```

> Also available per the brief but not templated above: **Article** (`/guides/*`) and **VideoObject** (any page with video) — add when that content exists (§5).
