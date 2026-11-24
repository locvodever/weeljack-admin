import { Injectable, inject, signal } from '@angular/core';
import { DEMO_NOW } from './demo-time';
import type { Ticket, TicketDraft } from './models';
import { TicketService } from './ticket.service';

const ID_PREFIX = 'WJ-';

/**
 * The tickets page's working copy of the demo tickets: seeded from `TicketService`, edited in
 * memory and back to the mock data on reload (M1). Dates written here are the demo anchor, never
 * the clock. `TicketService` and the dashboard keep reading the untouched mock data.
 */
@Injectable({ providedIn: 'root' })
export class TicketStore {
  private readonly items = signal<readonly Ticket[]>(inject(TicketService).all);

  /**
   * The highest `WJ-<n>` number ever issued: seeded from the mock data and only ever raised, so a
   * deleted ticket's id is never handed out again.
   */
  private lastNumber = highestNumber(this.items());

  /** Every ticket, in the order they were added. */
  readonly all = this.items.asReadonly();

  /** Adds a ticket under a new `WJ-<n>` id, one past the highest ever issued, and returns it. */
  create(draft: TicketDraft): Ticket {
    const stamp = new Date(DEMO_NOW).toISOString();
    this.lastNumber += 1;
    const id = `${ID_PREFIX}${this.lastNumber}`;
    const ticket: Ticket = { ...draft, id, created: stamp, updated: stamp };
    this.items.update((items) => [...items, ticket]);
    return ticket;
  }

  /** Replaces what the form edits on ticket `id` and stamps `updated`; `undefined` if there is no such ticket. */
  update(id: string, draft: TicketDraft): Ticket | undefined {
    const current = this.items().find((ticket) => ticket.id === id);
    if (current === undefined) {
      return undefined;
    }
    const next: Ticket = { ...current, ...draft, updated: new Date(DEMO_NOW).toISOString() };
    this.items.update((items) => items.map((ticket) => (ticket.id === id ? next : ticket)));
    return next;
  }

  /** Removes the tickets with these ids and returns how many were there. */
  remove(ids: readonly string[]): number {
    const doomed = new Set(ids);
    const before = this.items().length;
    this.items.update((items) => items.filter((ticket) => !doomed.has(ticket.id)));
    return before - this.items().length;
  }
}

/** The highest number in the tickets' `WJ-<n>` ids, or 0 for none. */
function highestNumber(tickets: readonly Ticket[]): number {
  return tickets.reduce((max, ticket) => {
    const number = Number(ticket.id.slice(ID_PREFIX.length));
    return Number.isFinite(number) ? Math.max(max, number) : max;
  }, 0);
}
