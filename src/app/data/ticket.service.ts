import { Injectable } from '@angular/core';
import type { Ticket } from './models';
import { TICKETS } from './tickets';

/** Read-only access to the demo's tickets, shared by the dashboard and the tickets page. */
@Injectable({ providedIn: 'root' })
export class TicketService {
  readonly all: readonly Ticket[] = TICKETS;

  /** The `count` most recently updated tickets, newest first. */
  recent(count: number): readonly Ticket[] {
    return [...this.all].sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, count);
  }

  /** Tickets not yet resolved. */
  openCount(): number {
    return this.all.filter((ticket) => ticket.status !== 'resolved').length;
  }
}
