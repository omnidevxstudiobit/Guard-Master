export interface NavItem {
  label: string;
  href: string;
  /**
   * Optional flyout. A parent still carries a real `href` — it is a link
   * first and a menu second, so it works with JS off, on touch, and for a
   * crawler that never opens anything.
   */
  children?: NavGroup[];
}

/**
 * A labelled block inside a flyout. The label is what makes
 * "Products → Clear View → Panels" readable as a hierarchy without building a
 * second level of hover menu, which is the interaction people miss most often
 * on touch and with a keyboard.
 */
export interface NavGroup {
  label: string;
  items: NavItem[];
}

/**
 * Brief §3 asked for "six product/content items plus a red 'Get a Quote'
 * button". That held while every product was a sibling of every other one. It
 * stopped holding once Gallery arrived and the Clear View system had four
 * pages of its own: eight flat items is not a navigation, it is a list.
 *
 * So the products collapse into one flyout that states the hierarchy the
 * catalogue actually has — Clear View is a *system*, and panels and posts are
 * parts of one thing, where fixtures and accessories fit any of it. The bar is
 * back to four items plus the CTA, which is nearer the brief's intent than
 * eight would have been.
 *
 * Every link in the flyout is a plain `<a>` in the server HTML, so the
 * crawlable link set is unchanged from when they were all top-level.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Products',
    /* Parent href is the panels page — the entry point to the system, and
       what a click on the parent should do when a flyout can't open. */
    href: '/clear-view-fencing-panels',
    children: [
      {
        label: 'Clear View',
        items: [
          { label: 'Panels', href: '/clear-view-fencing-panels' },
          { label: 'Posts', href: '/clear-view-fencing-posts' },
        ],
      },
      {
        label: 'Fit & Finish',
        items: [
          { label: 'Fixtures & Screws', href: '/fixtures-and-screws' },
          { label: 'Accessories & Toppings', href: '/clear-fencing-accessories' },
        ],
      },
    ],
  },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Projects', href: '/projects' },
  { label: 'Warranties', href: '/warranties-and-guarantees' },
];

/** Flattened — the mobile overlay lists every destination, not the grouping. */
export const NAV_LINKS: NavItem[] = NAV_ITEMS.flatMap((item) =>
  item.children ? item.children.flatMap((group) => group.items) : [item],
);

export const CTA: NavItem = { label: 'Get a Quote', href: '/clear-fencing-estimator' };

/**
 * "Configure Your System" — the secondary CTA that sits beside the red quote
 * button on the product pages and in a couple of homepage sections.
 *
 * It used to point at `/quote-estimator`, the same place as the red button
 * next to it, which made the pair of buttons two labels for one destination.
 * It now lands on the panel pricing table, which is where "configure" actually
 * happens for a first-time visitor: pick the aperture, height and finish, watch
 * the price move, add it to the basket. The estimator is still one click away
 * from there, and the red CTA still goes straight to it.
 *
 * Exported as a constant rather than typed into six templates so the anchor and
 * the section id in PanelPricing.astro cannot drift apart silently — an `#id`
 * that stops matching fails quietly, landing people at the top of the page with
 * no error anywhere.
 */
export const CONFIGURE: NavItem = {
  label: 'Configure Your System',
  href: '/clear-view-fencing-panels#panel-pricing',
};
