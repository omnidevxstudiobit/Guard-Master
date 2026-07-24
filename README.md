# Guard Master

The Guard Master Fencing Solutions website — a premium high-security perimeter fencing
manufacturer's site, built for the US market.

**Stack:** [Astro](https://astro.build) (static output) · [Tailwind CSS v4](https://tailwindcss.com) · [GSAP](https://gsap.com)

**Client:** Wire Ventures CC t/a Guard Master Fencing Solutions

---

## Project docs

The design/content decisions this build follows live alongside the code, at the repo root:

- `businessguide.md` — positioning, target customers, product range, commercial model
- `designguide.md` — typography, colour system, layout and motion principles
- `animationguide.md` — the motion rules every section is built against
- `seoguide.md` — heading hierarchy, metadata, structured data
- `referencewbsite.md` — competitor/reference site audit

## Non-negotiables (in priority order)

1. **SEO performance** — organic ranking is the commercial engine; design serves SEO.
2. **Load speed** — sub-2-second LCP on 4G mobile; motion must never delay first paint.
3. **Design quality** — premium and motion-led, but only within constraints 1–2.

The site is static-first: every page is prerendered HTML with copy in the DOM before any
JavaScript runs. Motion is progressive enhancement only — the site is fully readable, functional,
and indexable with JavaScript disabled. Heavy interactive elements (the product visualiser, the
quote estimator) are lazy-loaded below the fold, never on the critical path.

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:4321
npm run build    # produce a static build in dist/
npm run preview  # preview the production build locally
npm run check    # type-check .astro and TypeScript files
```

## Project structure

```text
src/
├── components/
│   ├── nav/          NavCenterSplit — the header
│   ├── sections/      Homepage sections (Hero, Proof358, SystemAssembly, FinishLadder, ...)
│   ├── ui/            Reusable primitives (Logo, ...)
│   └── DemoStage.astro  Placeholder for sections not yet built
├── data/             nav.ts — nav items + primary CTA (single source of truth for both)
├── layouts/          BaseLayout — <head>, global.css import, per-page title/description
├── pages/            index.astro — the homepage
└── styles/           global.css — Tailwind entry + Guard Master design tokens
```

Each homepage section is a self-contained `.astro` component: static-first markup (readable and
complete with JavaScript disabled), scoped styles, and — where it earns its keep — a small script
that idle-loads GSAP for scroll-driven motion. animationguide.md documents the rules every one of
them follows.

## Design tokens

Brand colors, fonts, and radii live as CSS custom properties in the `@theme` block in
`src/styles/global.css`, exposed as Tailwind utilities (`bg-gm-black`, `text-gm-red`, etc.). See
designguide.md §2 for the full palette and sourcing notes.

## Path aliases

`@/*`, `@components/*`, `@layouts/*`, `@data/*`, `@lib/*`, `@scripts/*`, `@styles/*` — defined in
`tsconfig.json` to keep imports short and stable. (`@lib` and `@scripts` are reserved for code that
doesn't exist yet.)

## Deployment

Static output, deployed on [Vercel](https://vercel.com) — it auto-detects the Astro project and
runs `npm run build`, serving `dist/`. No adapter or `vercel.json` is needed for this static site;
one will only be needed if/when server-rendered routes (e.g. the quote estimator's lead-capture
endpoint) are added.
