import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AgentService } from '../../data/agent.service';
import { DashboardService } from '../../data/dashboard.service';
import { TicketService } from '../../data/ticket.service';
import { ActivityFeed } from './activity-feed/activity-feed';
import { AgentWorkloadList } from './agent-workload/agent-workload';
import { RecentTickets } from './recent-tickets/recent-tickets';
import { StatCards } from './stat-cards/stat-cards';
import { StatusChart } from './status-chart/status-chart';

/**
 * The service-desk dashboard at `/`: the day's four figures first, then the work (recent tickets
 * and the status chart), then the team (agent workload and the activity feed). The page reads its
 * data from the root services and hands it to presentational widgets.
 */
@Component({
  selector: 'app-dashboard',
  imports: [ActivityFeed, AgentWorkloadList, RecentTickets, StatCards, StatusChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private readonly dashboard = inject(DashboardService);
  private readonly agents = inject(AgentService);
  private readonly tickets = inject(TicketService);

  protected readonly stats = this.dashboard.stats();
  protected readonly recent = this.tickets.recent(5);
  protected readonly workload = this.agents.workload();
  protected readonly weekly = this.dashboard.weeklyStatus;
  protected readonly activity = this.dashboard.activity;
}
