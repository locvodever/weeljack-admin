import { describe, expect, it } from 'vitest';
import { TICKETS } from '../../data/tickets';
import { filterTickets, sortTickets } from './ticket-query';

describe('filterTickets', () => {
  it('returns every ticket for a blank query', () => {
    expect(filterTickets(TICKETS, '')).toBe(TICKETS);
    expect(filterTickets(TICKETS, '   ')).toBe(TICKETS);
  });

  it('matches id, subject, requester, assignee, priority and status, ignoring case', () => {
    const first = TICKETS[0];
    expect(first).toBeDefined();
    expect(filterTickets(TICKETS, first?.id.toLowerCase() ?? '').map((t) => t.id)).toEqual([
      first?.id,
    ]);
    expect(filterTickets(TICKETS, 'URGENT').every((t) => t.priority === 'urgent')).toBe(true);
    expect(filterTickets(TICKETS, 'in progress').every((t) => t.status === 'in-progress')).toBe(
      true,
    );
    expect(filterTickets(TICKETS, 'Mara Okafor').length).toBeGreaterThan(0);
  });

  it('finds nothing for text no ticket holds', () => {
    expect(filterTickets(TICKETS, 'zzz-no-such-ticket')).toEqual([]);
  });
});

describe('sortTickets', () => {
  it('orders every ticket by the field, ascending or descending', () => {
    const up = sortTickets(TICKETS, 'subject', 1).map((t) => t.subject);
    const down = sortTickets(TICKETS, 'subject', -1).map((t) => t.subject);

    expect(up.length).toBe(TICKETS.length);
    expect(up).toEqual([...up].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })));
    expect(down).toEqual([...up].reverse());
  });

  it('sorts numbers in text by value and leaves the input alone', () => {
    const sorted = sortTickets(TICKETS, 'id', -1);

    expect(sorted[0]?.id).toBe('WJ-1032');
    expect(TICKETS[0]?.id).toBe('WJ-1001');
  });

  it('returns the tickets as given with no field or an unknown one', () => {
    expect(sortTickets(TICKETS, undefined, 1)).toBe(TICKETS);
    expect(sortTickets(TICKETS, 'description', 1)).toBe(TICKETS);
  });
});
