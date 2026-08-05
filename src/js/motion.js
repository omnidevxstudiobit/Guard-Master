/* ==========================================================================
   Motion — same stack the reference runs, for the same reasons.

   Read off quietcubes.com's live instances:
     Lenis 1.2.3                        smooth scroll (the whole "heavy" feel)
     Webflow IX2 SCROLLING_IN_VIEW ×201 scroll-linked drift on nearly everything
     GSAP ScrollTrigger ×21             ALL one-shot: scrub:false, pin:false
     GSAP SplitText                     line reveals on headings

   The important finding: nothing is pinned and nothing is scrub-scrubbed in
   GSAP. The richness comes from (a) Lenis smoothing and (b) two hundred small
   scroll-linked drifts. So that is what we build — many cheap parallaxes, not
   a few expensive pinned timelines.
   ========================================================================== */

import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

gsap.registerPlugin(ScrollTrigger, SplitText)

const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches

/* One-shot triggers don't always fire for elements already in view at
   load — with a clamped start of 0 the scroll position never CROSSES the
   start, so onEnter never happens and entrances stay stuck at their
   hidden first frame. (isActive is unreliable inside onRefresh — it read
   undefined here — so compare scroll to start directly.) */
const playIfVisible = (self) => {
  if (self.scroll() >= self.start && self.animation && self.animation.progress() === 0) {
    self.animation.play()
  }
}

/* ── smooth scroll ────────────────────────────────────────────────
   Native scroll stays intact — Lenis only smooths the delivery, so
   End, deep links, find-in-page and SEO all keep working. */
export function initSmoothScroll () {
  if (reduce) return null
  const lenis = new Lenis({
    lerp: 0.1,                 // matches the reference's damping
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.6,
  })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  window.lenis = lenis
  return lenis
}

/* ── scroll-linked drift (their SCROLLING_IN_VIEW) ────────────────
   data-par="-12"  → travels -12% of its own height across the scroll.
   Cheap, and the whole point is to have lots of them. */
function initParallax () {
  gsap.utils.toArray('[data-par]').forEach((el) => {
    const amt = parseFloat(el.dataset.par) || -12
    gsap.fromTo(el,
      { yPercent: -amt / 2 },
      {
        yPercent: amt / 2, ease: 'none',
        scrollTrigger: {
          trigger: el.closest('[data-par-frame]') || el.parentElement,
          start: 'top bottom', end: 'bottom top', scrub: true,
        },
      })
  })

  // slow zoom-out as a scene passes — used on the full-bleed stages
  gsap.utils.toArray('[data-zoom]').forEach((el) => {
    gsap.fromTo(el, { scale: 1.22 }, {
      scale: 1, ease: 'none',
      scrollTrigger: {
        trigger: el.closest('[data-par-frame]') || el.parentElement,
        start: 'top bottom', end: 'bottom top', scrub: true,
      },
    })
  })

  // horizontal drift for bands and strips
  gsap.utils.toArray('[data-drift]').forEach((el) => {
    const amt = parseFloat(el.dataset.drift) || 8
    gsap.fromTo(el, { xPercent: -amt / 2 }, {
      xPercent: amt / 2, ease: 'none',
      scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  })
}

/* ── heading reveals (their ScrollTrigger + SplitText) ────────────
   One-shot, exactly like theirs: scrub:false, play once on enter. */
function initSplitHeadings () {
  gsap.utils.toArray('[data-split]').forEach((el) => {
    const split = SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'sp-line' })
    gsap.from(split.lines, {
      yPercent: 110,
      duration: 1.05,
      stagger: 0.085,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: el,
        start: 'clamp(top 78%)',          // their exact pattern
        toggleActions: 'play none none none',
        onRefresh: playIfVisible,
      },
    })
  })
}

/* ── simple entrances ─────────────────────────────────────────── */
function initRise () {
  gsap.utils.toArray('[data-rise]').forEach((el) => {
    gsap.from(el, {
      y: parseFloat(el.dataset.rise) || 44,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'clamp(top 84%)', toggleActions: 'play none none none', onRefresh: playIfVisible },
    })
  })

  gsap.utils.toArray('[data-rise-group]').forEach((host) => {
    gsap.from(host.children, {
      y: 52, opacity: 0, duration: .95, stagger: 0.07, ease: 'power3.out',
      scrollTrigger: { trigger: host, start: 'clamp(top 82%)', toggleActions: 'play none none none', onRefresh: playIfVisible },
    })
  })
}

/* ── staircase: each column settles on its own beat ───────────── */
function initStair () {
  gsap.utils.toArray('[data-stair]').forEach((host) => {
    gsap.from(host.children, {
      y: (i) => 70 + i * 42,
      opacity: 0,
      duration: 1.15,
      stagger: 0.09,
      ease: 'power3.out',
      scrollTrigger: { trigger: host, start: 'clamp(top 80%)', toggleActions: 'play none none none', onRefresh: playIfVisible },
    })
  })
}

/* ── magnetic controls — key CTAs lean toward the pointer ─────── */
function initMagnetic () {
  gsap.utils.toArray('[data-mag]').forEach((el) => {
    const pull = parseFloat(el.dataset.mag) || 10
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' })
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect()
      xTo(((e.clientX - r.left) / r.width - 0.5) * pull)
      yTo(((e.clientY - r.top) / r.height - 0.5) * pull)
    })
    el.addEventListener('pointerleave', () => { xTo(0); yTo(0) })
  })
}

/* ── cursor-reactive (their MOUSE_MOVE ×13) ───────────────────── */
function initCursor () {
  const hosts = gsap.utils.toArray('[data-cursor]')
  if (!hosts.length) return
  hosts.forEach((host) => {
    const depth = parseFloat(host.dataset.cursor) || 14
    const xTo = gsap.quickTo(host, 'x', { duration: 0.9, ease: 'power3' })
    const yTo = gsap.quickTo(host, 'y', { duration: 0.9, ease: 'power3' })
    const parent = host.closest('[data-cursor-frame]') || host.parentElement
    parent.addEventListener('pointermove', (e) => {
      const r = parent.getBoundingClientRect()
      xTo(((e.clientX - r.left) / r.width - 0.5) * depth)
      yTo(((e.clientY - r.top) / r.height - 0.5) * depth)
    })
    parent.addEventListener('pointerleave', () => { xTo(0); yTo(0) })
  })
}

/* ── sticky sequence ──────────────────────────────────────────────
   Their .tech-section pattern: one sticky viewport, N stacked beats.
   Scroll progress across the tall parent cross-fades the layers and
   swaps the copy — the scene changes without the page moving. */
function initSequences () {
  gsap.utils.toArray('[data-seq]').forEach((sec) => {
    const stick = sec.querySelector('.sticky-in')
    const beats = gsap.utils.toArray('[data-beat]', sec)
    if (!beats.length) return

    // start on the first beat only
    beats.forEach((b, i) => gsap.set(b, { autoAlpha: i === 0 ? 1 : 0 }))
    const imgs = beats.map(b => b.querySelector('.layer-img')).filter(Boolean)
    imgs.forEach((im, i) => gsap.set(im, { scale: i === 0 ? 1 : 1.14 }))

    const tl = gsap.timeline({
      scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: 0.8 },
    })
    beats.forEach((b, i) => {
      if (i === 0) return
      tl.to(beats[i - 1], { autoAlpha: 0, duration: 1 }, i - 1)
        .to(b, { autoAlpha: 1, duration: 1 }, i - 1)
      if (imgs[i]) tl.to(imgs[i], { scale: 1, duration: 1.4, ease: 'none' }, i - 1)
      if (imgs[i - 1]) tl.to(imgs[i - 1], { scale: .94, duration: 1.4, ease: 'none' }, i - 1)
    })

    // dots / counter, if the markup provides them
    const dots = gsap.utils.toArray('[data-seq-dot]', sec)
    if (dots.length) {
      ScrollTrigger.create({
        trigger: sec, start: 'top top', end: 'bottom bottom',
        onUpdate: (self) => {
          const i = Math.min(beats.length - 1, Math.round(self.progress * (beats.length - 1)))
          dots.forEach((d, n) => d.setAttribute('aria-current', String(n === i)))
        },
      })
    }

    /* Slow drift on the held scene — but ONLY on an inner layer.
       Never transform the sticky element itself: doing so changes its
       own offsets, ScrollTrigger re-measures, and the two feed each
       other until the renderer locks. */
    const drift = stick && stick.querySelector('[data-seq-drift]')
    if (drift) {
      gsap.fromTo(drift, { yPercent: 0 }, {
        yPercent: -3, ease: 'none',
        scrollTrigger: { trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true },
      })
    }
  })
}

/* ── section-driven page colour ───────────────────────────────── */
function initBgFollow () {
  const secs = gsap.utils.toArray('[data-bg]')
  if (!secs.length) return
  secs.forEach((s) => {
    ScrollTrigger.create({
      trigger: s,
      start: 'top 55%',
      end: 'bottom 45%',
      onToggle: (self) => {
        if (!self.isActive) return
        gsap.to(document.documentElement, {
          '--page-bg': s.dataset.bg,
          '--page-ink': s.dataset.ink || '#14121a',
          duration: 0.9, ease: 'power2.out', overwrite: 'auto',
        })
      },
    })
  })
}

export function initMotion () {
  // start on the first section's colours — a dark opener must not flash light
  const first = document.querySelector('[data-bg]')
  gsap.set(document.documentElement, {
    '--page-bg': first?.dataset.bg || '#f7f8f6',
    '--page-ink': first?.dataset.ink || '#14121a',
  })
  initSmoothScroll()
  if (reduce) return
  window.ScrollTrigger = ScrollTrigger      // so it can be inspected from the console
  initParallax()
  initSplitHeadings()
  initRise()
  initStair()
  initCursor()
  initMagnetic()
  initSequences()
  initBgFollow()
  ScrollTrigger.refresh()
  // images finishing late would otherwise leave triggers measured wrong
  addEventListener('load', () => ScrollTrigger.refresh())
}
