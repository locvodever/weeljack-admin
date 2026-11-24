import { wjIconLayoutDashboard } from 'weeljack-ng/icon';
import type { WjIconDef } from 'weeljack-ng/icon';

export interface NavLink {
  readonly label: string;
  /** Absolute router path. */
  readonly path: string;
  /** Drawn before the label as a decoration: the link's name stays its label. */
  readonly icon?: WjIconDef;
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
  {
    id: 'home',
    label: 'Home',
    links: [{ label: 'Dashboard', path: '/', icon: wjIconLayoutDashboard }],
  },
  { id: 'service-desk', label: 'Service desk', links: [] },
  { id: 'pages', label: 'Pages', links: [] },
];
