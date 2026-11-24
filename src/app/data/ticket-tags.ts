import type { TicketPriority, TicketStatus } from './models';

/** The colour roles of a `wj-tag`. */
export type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast';

/** Which tag colour each priority gets, on the dashboard and the tickets page alike. */
export const PRIORITY_SEVERITY: Readonly<Record<TicketPriority, TagSeverity>> = {
  low: 'secondary',
  normal: 'info',
  high: 'warn',
  urgent: 'danger',
};

/** Which tag colour each status gets, on the dashboard and the tickets page alike. */
export const STATUS_SEVERITY: Readonly<Record<TicketStatus, TagSeverity>> = {
  open: 'info',
  'in-progress': 'warn',
  waiting: 'secondary',
  resolved: 'success',
};
