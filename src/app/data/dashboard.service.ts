import { Injectable, inject } from '@angular/core';
import { ACTIVITY, STAT_FIGURES, WEEKLY_STATUS } from './dashboard-data';
import { DEMO_NOW, dayNumber } from './demo-time';
import type { ActivityGroup, ActivityGroupName, ActivityItem, Stat, WeeklyStatus } from './models';
import { TicketService } from './ticket.service';

/** Groups activity into Today, Yesterday and Earlier by UTC calendar day, skipping empty groups. */
export function groupActivity(items: readonly ActivityItem[]): readonly ActivityGroup[] {
  const today = dayNumber(DEMO_NOW);
  const nameOf = (item: ActivityItem): ActivityGroupName => {
    const age = today - dayNumber(Date.parse(item.at));
    return age <= 0 ? 'Today' : age === 1 ? 'Yesterday' : 'Earlier';
  };
  const names: readonly ActivityGroupName[] = ['Today', 'Yesterday', 'Earlier'];
  return names
    .map((name) => ({ name, items: items.filter((item) => nameOf(item) === name) }))
    .filter((group) => group.items.length > 0);
}

/** Read-only figures for the dashboard: the stats, the weekly status counts and the activity feed. */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly tickets = inject(TicketService);

  readonly weeklyStatus: WeeklyStatus = WEEKLY_STATUS;
  readonly activity: readonly ActivityGroup[] = groupActivity(ACTIVITY);

  /** The four stat cards. Open tickets is counted from the ticket data; the rest are fixed. */
  stats(): readonly Stat[] {
    return [
      {
        id: 'open',
        label: 'Open tickets',
        value: String(this.tickets.openCount()),
        delta: STAT_FIGURES.openDelta,
      },
      { id: 'sla', label: 'Breaching SLA today', ...STAT_FIGURES.sla },
      { id: 'response', label: 'Median first response', ...STAT_FIGURES.response },
      { id: 'csat', label: 'Satisfaction', ...STAT_FIGURES.csat },
    ];
  }
}
