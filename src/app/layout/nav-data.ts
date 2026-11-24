export interface NavLink {
  readonly label: string;
  /** Absolute router path. */
  readonly path: string;
}

export interface NavGroup {
  readonly id: string;
  readonly label: string;
  readonly links: readonly NavLink[];
}

/**
 * The sidebar tree. A link is listed only once its route exists, and a group with no links is not
 * rendered, so "Service desk" and "Pages" show up when T2 to T5 add their routes.
 */
export const NAV_GROUPS: readonly NavGroup[] = [
  { id: 'home', label: 'Home', links: [{ label: 'Dashboard', path: '/' }] },
  { id: 'service-desk', label: 'Service desk', links: [] },
  { id: 'pages', label: 'Pages', links: [] },
];
