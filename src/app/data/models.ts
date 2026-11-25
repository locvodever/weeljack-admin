export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in-progress' | 'waiting' | 'resolved';

export interface Ticket {
  /** Shown to people, e.g. `WJ-1042`. */
  readonly id: string;
  readonly subject: string;
  /** The requester's display name (made up). */
  readonly requester: string;
  readonly priority: TicketPriority;
  readonly status: TicketStatus;
  /** The assigned agent's display name. */
  readonly assignee: string;
  /** Free text from the ticket form; the mock tickets have none. */
  readonly description?: string;
  /** ISO 8601 instants, always relative to the demo anchor in `demo-time.ts`. */
  readonly created: string;
  readonly updated: string;
}

/** What the ticket form edits: a ticket without its id and dates. */
export type TicketDraft = Omit<Ticket, 'id' | 'created' | 'updated'>;

export interface Agent {
  readonly id: string;
  readonly name: string;
  /** How many open tickets make this agent's workload 100 %. */
  readonly capacity: number;
}

export interface AgentWorkload {
  readonly agent: Agent;
  readonly open: number;
  /** A whole number from 0 to 100. */
  readonly percent: number;
}

export type StatId = 'open' | 'sla' | 'response' | 'csat';

export interface Stat {
  readonly id: StatId;
  readonly label: string;
  /** The figure as shown, unit included: `25`, `14 min`, `94%`. */
  readonly value: string;
  /** What changed, in words: `Up 4 since yesterday`. */
  readonly delta: string;
}

export interface ActivityItem {
  readonly id: string;
  /** A whole sentence, plain text. */
  readonly text: string;
  /** ISO 8601 instant. */
  readonly at: string;
}

export type ActivityGroupName = 'Today' | 'Yesterday' | 'Earlier';

export interface ActivityGroup {
  readonly name: ActivityGroupName;
  readonly items: readonly ActivityItem[];
}

/** Tickets of each status in each week; `values[i]` belongs to `weeks[i]`. */
export interface WeeklyStatus {
  readonly weeks: readonly string[];
  readonly series: readonly { readonly status: TicketStatus; readonly values: readonly number[] }[];
}

export const PRIORITY_LABEL: Readonly<Record<TicketPriority, string>> = {
  low: 'Low',
  normal: 'Normal',
  high: 'High',
  urgent: 'Urgent',
};

export const STATUS_LABEL: Readonly<Record<TicketStatus, string>> = {
  open: 'Open',
  'in-progress': 'In progress',
  waiting: 'Waiting',
  resolved: 'Resolved',
};

/** Initials of a display name: the first letters of its first and last words, upper case. */
export function initials(name: string): string {
  const words = name.split(/\s+/).filter((word) => word !== '');
  const first = words[0]?.charAt(0) ?? '';
  const last = words.length > 1 ? (words[words.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase();
}
