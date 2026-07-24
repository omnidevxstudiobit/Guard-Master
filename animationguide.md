# Guard Master — Animation & Motion Guide

> Source: *Guard Master Website Wireframe & Build Brief v1.0* (motion rules, cited by page + section) **+ project decisions** (island architecture, anti-AI-vibe — marked as project rules).
> **Motion is priority #3** — it exists only *within* SEO (#1) and load speed (#2): *"Award-worthy, motion-led, premium — but only achieved within constraints 1 and 2."* (Page 2, §1).

---

## 0. Non-negotiable governing rules
Every animation and interactive layout obeys these five. **If a motion idea breaks any one of them, it does not ship.**

1. **No AI-generated look.** No layouts, cards, or heavy/gratuitous grids that read as AI-generated. Motion and composition must feel bespoke and premium (see `designguide.md` §11).
2. **Motion lives in Astro's island architecture.** Animation is wired **per-island** via `client:*` hydration — never a global monolithic script that runs on every page.
3. **Zero cost to DOM / LCP / FCP / speed.** No animation may delay first paint, cause layout shift (CLS), or block the critical path. Speed and SEO always win over motion.
4. **UI / UX / icons must not look AI-made.** Authentic, hand-crafted interface; one consistent, real icon set.
5. **Mobile-first — must work on the phone, at any cost.** Whatever animation or layout is built MUST function correctly on the phone version. **No exceptions.**

---

## 1. Motion is progressive enhancement
**Source: Page 2, §1**

- HTML + copy exist in the DOM **before any JS runs** (static-first). Motion is only a layer on top.
- **If JS fails, the site is still complete, readable, and indexable** — nothing that matters depends on animation.
- Motion never blocks or delays content.

---

## 2. Island architecture for motion
**Project decision (ties to `designguide.md` §11 + brief §1)**

- Animation is delivered through **Astro islands** — each interactive piece hydrates independently (`client:visible` / `client:idle` for below-the-fold), so a page ships only the motion JS it actually uses.
- **No global bootstrap** that boots every animation on every page.
- **GSAP + ScrollTrigger** is the motion library — loaded **only inside the islands/scripts that need it**, never in the homepage above-the-fold bundle.
- Heavy interactive islands (**quote estimator, product configurator**) are **route-level code-split and lazy-mounted below the fold** (Page 2, §1) — their motion/interactivity never touches the critical path.

---

## 3. Never harm DOM / LCP / FCP / speed
**Source: Page 2, §1 + project rule #3**

- **Sub-2-second LCP on 4G mobile** — motion must never delay first paint.
- **Animate only compositor-friendly properties** — `transform` and `opacity`. Never animate layout properties (width/height/top/left/margin) that trigger reflow.
- **No layout shift (CLS = 0 target).** Reserve space for anything that animates in; never push content around after paint.
- **The hero poster image is the LCP element** (Page 4, §4.1) — it renders immediately; nothing animates before or over it that would delay it.
- Motion JS is **deferred / idle / below-the-fold**, never render-blocking.

---

## 4. Above-the-fold rule
**Source: Page 2, §1 + Page 4, §4.1**

- **No motion library on the homepage above the fold — CSS transforms only.**
- **Hero:** priority-loaded poster image (LCP) → a muted **≤6-second** video loop swaps in **after load**; **disabled** under `prefers-reduced-motion` and save-data.
- Any above-the-fold entrance is **pure CSS** (transform / opacity) — no GSAP.

---

## 5. What animates, and how
| Element | Motion | How / where |
|---|---|---|
| **Hero kicker** (*"See Through It…"*) | Animated entrance above the H1 | **CSS only** (above the fold) — Page 5 |
| **Header** | Translucent blur appears on scroll | Lightweight, sticky — Page 4, §4.1 |
| **Hero background** | Poster → muted ≤6s video swap after load | JS swap; reduced-motion / save-data gated — Page 4, §4.1 |
| **Scroll reveals** | Fade / rise on entering viewport | GSAP ScrollTrigger, **below the fold**, in an island; reduced-motion gated |
| **Counters / stats** | Count-up | GSAP, below fold, reduced-motion gated |
| **Projects** | Horizontal scroll strip | Below the fold — Page 4, §4.1 |
| **Tabs / FAQ accordion** | Open / close transitions | **CSS** — content stays in the DOM, crawlable (see `seoguide.md` §0) |

---

## 6. Reduced-motion & save-data
- Respect `prefers-reduced-motion: reduce` — decorative motion (scroll reveals, counters, hero video) is skipped; elements rest in their visible state (no content lost).
- Respect **save-data** — the hero video does not load.

---

## 7. Mobile-first motion — must work on the phone, at any cost
**Source: Page 7, §4.8 + governing rule #5**

- Every animation is **validated on the phone version first** — the majority of US search traffic is mobile.
- Motion must stay **smooth on low-end phones** — compositor-only properties, few simultaneous animations, no jank.
- Touch interactions (sticky bottom bar, configurator stacking, full-screen nav overlay) must animate correctly on touch.
- **Tap targets ≥ 44px**, even during and after animated states.
- If an animation can't run cleanly on mobile, it is **cut — never shipped desktop-only.**

---

## 8. Anti-AI-vibe for motion
**Project rule (reinforces the Ameristar polish bar, Page 9 §9)**

- Motion should feel **intentional and premium** — not the generic "everything fades up on scroll" AI-template default.
- **Restraint wins:** a few well-crafted, brand-appropriate moments beat blanket animation.
- Easing, timing, and choreography are **hand-tuned** to match award-level polish.

---

## Quick reference
- **5 rules:** no AI look · islands-only motion · zero speed/LCP/FCP cost · authentic UI/icons · works on mobile at any cost.
- **Above the fold:** CSS transforms only — no GSAP.
- **GSAP + ScrollTrigger:** below the fold, inside islands, reduced-motion gated.
- **Animate:** `transform` + `opacity` only; CLS = 0.
- **Hero:** poster = LCP; video swaps after load; off under reduced-motion / save-data.
- **Priority order:** SEO #1 > speed #2 > motion #3.
