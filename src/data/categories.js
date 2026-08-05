/* The four home-page pills. Split by who it's for, not by component —
   a homeowner shops for "a fence for my house", never for "a post".
   Accents are computed to carry white label text at AA (see docs/design-reference.md). */

export const CATEGORIES = [
  {
    id: 'home-estate',
    name: 'Home & Estate',
    href: '/home-estate/',
    accent: '#2E5E45',                 // garden green   — 7.49:1 on white text
    accentSoft: 'rgba(46,94,69,.08)',
    lede: 'Keep the view. Lose the risk.',
    blurb: 'Clear View mesh you can see straight through, on a boundary nobody gets a toehold on.',
    products: ['vista', 'panels', 'posts', 'caps', 'hinges'],
    pill: '/images/products/clear-view-fencing-panels/8-640.webp',
    /* finishes are coatings — shown as swatches, not photos */
    finishes: [
      { t: 'Plain Galvanised', sw: 'linear-gradient(145deg,#d9dde0,#b6bcc1)',
        d: 'Bright zinc, straight off the line. The cheapest finish that still lasts outdoors.' },
      { t: 'Hot-Dip Galvanised', sw: 'linear-gradient(145deg,#c9ced2,#9aa1a8)',
        d: 'Thicker zinc with a visible spangle. For coastal air and hard weather.' },
      { t: 'Powder Coated', sw: 'linear-gradient(145deg,#3a3f45,#15181b)',
        d: 'Matte black over galvanising. Disappears against planting — the usual estate choice.' },
      { t: 'Plascoat', sw: 'linear-gradient(145deg,#1f4d33,#0e2a1c)',
        d: 'Thick polymer in satin green, and the only finish carrying the 10-year warranty.' },
    ],
  },
  {
    id: 'commercial',
    name: 'Commercial & Industrial',
    href: '/products/',
    accent: '#25445F',                 // steel navy     — 10.14:1
    accentSoft: 'rgba(37,68,95,.08)',
    lede: 'Built for sites that get tested.',
    blurb: '358 mesh, spikes and clamps engineered as one system for yards, depots and plant.',
    products: ['panels', 'posts', 'clamps', 'spikes'],
    pill: '/images/products/clear-view-fencing-panels/56-480.webp',
  },
  {
    id: 'high-security',
    name: 'High Security',
    href: '/products/',
    accent: '#8C2B20',                 // oxide red      — 8.46:1
    accentSoft: 'rgba(140,43,32,.08)',
    lede: 'For lines that must not be crossed.',
    blurb: 'Razor wire mesh, concertina coils and flat wrap for substations, storage and plant.',
    products: ['razormesh', 'coils', 'flatwrap', 'razorposts'],
    pill: '/images/products/razor-wire-mesh/img-6277-480.webp',
  },
  {
    id: 'gates',
    name: 'Gates & Entrances',
    href: '/products/',
    accent: '#6B4A2A',                 // bronze umber   — 7.96:1
    accentSoft: 'rgba(107,74,42,.08)',
    lede: 'The gap in the line, closed properly.',
    blurb: 'Sliding, swing and pedestrian gates with matched mesh infill so the boundary reads as one.',
    products: ['gates', 'hinges'],
    pill: '/images/products/accessories/sliding-gate-galvanized-clear-view-mesh-filling-reinforced-intermedia-spikes-600x442-480.webp',
  },
]

export const catById = (id) => CATEGORIES.find(c => c.id === id)
