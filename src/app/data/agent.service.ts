import { Injectable, inject } from '@angular/core';
import { AGENTS } from './agents';
import type { Agent, AgentWorkload } from './models';
import { TicketService } from './ticket.service';

/** Read-only access to the demo's agents and how full their queues are. */
@Injectable({ providedIn: 'root' })
export class AgentService {
  private readonly tickets = inject(TicketService);

  readonly all: readonly Agent[] = AGENTS;

  /** Each agent's unresolved tickets against their capacity, capped at 100 %. */
  workload(): readonly AgentWorkload[] {
    return this.all.map((agent) => {
      const open = this.tickets.all.filter(
        (ticket) => ticket.assignee === agent.name && ticket.status !== 'resolved',
      ).length;
      return { agent, open, percent: Math.min(100, Math.round((open / agent.capacity) * 100)) };
    });
  }
}
