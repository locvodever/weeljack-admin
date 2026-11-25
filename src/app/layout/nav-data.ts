import {
  wjIconCircleExclamationPoint,
  wjIconCircleQuestionMark,
  wjIconFile,
  wjIconLayoutDashboard,
  wjIconLayoutGrid,
  wjIconLock,
  wjIconLogIn,
  wjIconTicket,
} from 'weeljack-ng/icon';
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
 * rendered. "Pages" holds the full pages and the empty page; the landing page is listed first.
 */
export const NAV_GROUPS: readonly NavGroup[] = [
  {
    id: 'home',
    label: 'Home',
    links: [{ label: 'Dashboard', path: '/', icon: wjIconLayoutDashboard }],
  },
  {
    id: 'service-desk',
    label: 'Service desk',
    links: [{ label: 'Tickets', path: '/tickets', icon: wjIconTicket }],
  },
  {
    id: 'pages',
    label: 'Pages',
    links: [
      { label: 'Landing', path: '/landing', icon: wjIconLayoutGrid },
      { label: 'Login', path: '/auth/login', icon: wjIconLogIn },
      { label: 'Error', path: '/auth/error', icon: wjIconCircleExclamationPoint },
      { label: 'Access denied', path: '/auth/access', icon: wjIconLock },
      { label: '404', path: '/notfound', icon: wjIconCircleQuestionMark },
      { label: 'Empty', path: '/empty', icon: wjIconFile },
    ],
  },
];
