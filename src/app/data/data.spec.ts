import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { AgentService } from './agent.service';
import { DashboardService, groupActivity } from './dashboard.service';
import { DEMO_NOW, hoursAgo, relativeTime } from './demo-time';
import { initials } from './models';
import { TicketService } from './ticket.service';

describe('demo data', () => {
  it('has at least thirty tickets with unique ids and six agents', () => {
    const tickets = TestBed.inject(TicketService).all;

    expect(tickets.length).toBeGreaterThanOrEqual(30);
    expect(new Set(tickets.map((ticket) => ticket.id)).size).toBe(tickets.length);
    expect(TestBed.inject(AgentService).all.length).toBe(6);
  });

  it('gives every ticket a known assignee and dates before the demo anchor', () => {
    const names = new Set(TestBed.inject(AgentService).all.map((agent) => agent.name));

    for (const ticket of TestBed.inject(TicketService).all) {
      expect(names.has(ticket.assignee), ticket.id).toBe(true);
      expect(Date.parse(ticket.updated), ticket.id).toBeLessThanOrEqual(DEMO_NOW);
      expect(Date.parse(ticket.created), ticket.id).toBeLessThanOrEqual(Date.parse(ticket.updated));
    }
  });

  it('lists the five most recently updated tickets, newest first', () => {
    const recent = TestBed.inject(TicketService).recent(5);

    expect(recent.map((ticket) => ticket.id)).toEqual([
      'WJ-1032',
      'WJ-1031',
      'WJ-1030',
      'WJ-1029',
      'WJ-1023',
    ]);
  });

  it('measures workload as unresolved tickets over capacity, capped at 100', () => {
    const workload = TestBed.inject(AgentService).workload();

    for (const row of workload) {
      expect(row.percent).toBeGreaterThanOrEqual(0);
      expect(row.percent).toBeLessThanOrEqual(100);
    }
    const tomas = workload.find((row) => row.agent.name === 'Tomas Herrera');
    expect(tomas?.open).toBe(4);
    expect(tomas?.percent).toBe(100);
  });

  it('counts open tickets for the first stat and keeps four stats', () => {
    const stats = TestBed.inject(DashboardService).stats();

    expect(stats.map((stat) => stat.id)).toEqual(['open', 'sla', 'response', 'csat']);
    expect(stats[0]?.value).toBe(String(TestBed.inject(TicketService).openCount()));
  });

  it('groups activity by calendar day against the demo anchor', () => {
    const groups = groupActivity([
      { id: 'a', text: 'a', at: hoursAgo(1) },
      { id: 'b', text: 'b', at: hoursAgo(15) },
      { id: 'c', text: 'c', at: hoursAgo(60) },
    ]);

    expect(groups.map((group) => group.name)).toEqual(['Today', 'Yesterday', 'Earlier']);
  });

  it('words a time relative to the anchor', () => {
    expect(relativeTime(hoursAgo(0.5))).toBe('30 min ago');
    expect(relativeTime(hoursAgo(3))).toBe('3 h ago');
    expect(relativeTime(hoursAgo(24))).toBe('1 day ago');
    expect(relativeTime(hoursAgo(72))).toBe('3 days ago');
  });

  it('takes initials from the first and last word of a name', () => {
    expect(initials('Mara Okafor')).toBe('MO');
    expect(initials('Wen-Li Zhao Montgomery-Reyes')).toBe('WM');
    expect(initials('  prince ')).toBe('P');
    expect(initials('')).toBe('');
  });
});
