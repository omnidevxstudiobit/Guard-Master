export interface NavItem {
  label: string;
  href: string;
}

/**
 * Brief §3: "Keep the top navigation to the six product/content items plus a
 * red 'Get a Quote' button. Everything else lives in the footer."
 *
 * Both nav variants render exactly these six — the split is presentational
 * only, so the crawlable link set is identical either way.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: 'Panels', href: '/clear-view-fencing-panels' },
  { label: 'Posts', href: '/clear-view-fencing-posts' },
  { label: 'Fixtures', href: '/fixtures-and-screws' },
  { label: 'Accessories', href: '/accessories' },
  { label: 'Warranties', href: '/warranties-and-guarantees' },
  { label: 'Projects', href: '/projects' },
];

export const CTA: NavItem = { label: 'Get a Quote', href: '/quote-estimator' };
