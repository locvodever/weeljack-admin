import type { WjSortOrder } from 'weeljack-ng';
import { PRIORITY_LABEL, STATUS_LABEL, type Ticket } from '../../data/models';

/** Compares text the way `wj-table` sorts it: numbers inside it by value ("WJ-2" before "WJ-10"). */
const collator = new Intl.Collator(undefined, { numeric: true });

/** The tickets that contain `query`, ignoring case, in any text the table shows (or in the description). */
export function filterTickets(tickets: readonly Ticket[], query: string): readonly Ticket[] {
  const needle = query.trim().toLowerCase();
  if (needle === '') {
    return tickets;
  }
  return tickets.filter((ticket) =>
    [
      ticket.id,
      ticket.subject,
      ticket.description ?? '',
      ticket.requester,
      PRIORITY_LABEL[ticket.priority],
      STATUS_LABEL[ticket.status],
      ticket.assignee,
    ].some((text) => text.toLowerCase().includes(needle)),
  );
}

/**
 * The tickets ordered by one column's field, the same way `wj-table` orders its rows, so the CSV
 * export lists the tickets in the order the table shows them. Ties keep their incoming order.
 */
export function sortTickets(
  tickets: readonly Ticket[],
  field: string | undefined,
  order: WjSortOrder,
): readonly Ticket[] {
  if (field === undefined || !isTicketField(field)) {
    return tickets;
  }
  const direction = order < 0 ? -1 : 1;
  return [...tickets].sort((a, b) => direction * collator.compare(a[field], b[field]));
}

type SortField = 'id' | 'subject' | 'requester' | 'priority' | 'status' | 'assignee' | 'updated';

const SORT_FIELDS: readonly string[] = [
  'id',
  'subject',
  'requester',
  'priority',
  'status',
  'assignee',
  'updated',
];

function isTicketField(field: string): field is SortField {
  return SORT_FIELDS.includes(field);
}
