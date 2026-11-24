import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideWeeljack } from 'weeljack-ng';
import { wjPolice } from 'weeljack-ng/preset-police';
import { describe, expect, it } from 'vitest';
import type { Ticket } from '../../../data/models';
import { RecentTickets } from './recent-tickets';

const TICKETS: readonly Ticket[] = [
  {
    id: 'WJ-1',
    subject: 'Printer jams',
    requester: 'Ada Example',
    priority: 'urgent',
    status: 'open',
    assignee: 'Agent One',
    created: '2026-11-20T08:00:00.000Z',
    updated: '2026-11-21T08:00:00.000Z',
  },
  {
    id: 'WJ-2',
    subject: 'VPN drops',
    requester: 'Bo Sample',
    priority: 'low',
    status: 'resolved',
    assignee: 'Agent Two',
    created: '2026-11-19T08:00:00.000Z',
    updated: '2026-11-20T08:00:00.000Z',
  },
];

describe('RecentTickets', () => {
  async function render() {
    TestBed.configureTestingModule({
      providers: [provideWeeljack({ preset: wjPolice, darkMode: 'class' }), provideRouter([])],
    });
    const fixture = TestBed.createComponent(RecentTickets);
    fixture.componentRef.setInput('tickets', TICKETS);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('shows one row per ticket under named columns', async () => {
    const root = await render();

    const headers = Array.from(root.querySelectorAll('th')).map((th) => th.textContent.trim());
    expect(headers).toEqual(['Ticket', 'Subject', 'Requester', 'Priority', 'Status']);
    expect(root.querySelectorAll('tbody tr').length).toBe(2);
    expect(root.querySelector('h2')?.textContent.trim()).toBe('Recent tickets');
  });

  it('links to every ticket from the heading row', async () => {
    const root = await render();

    const link = root.querySelector<HTMLAnchorElement>('a.all-link');
    expect(link?.textContent.trim()).toBe('View all tickets');
    expect(link?.getAttribute('href')).toBe('/tickets');
    expect(link?.closest('.head')?.querySelector('h2#recent-title')).not.toBeNull();
    expect(root.querySelector('section')?.getAttribute('aria-labelledby')).toBe('recent-title');
  });

  it('gives the link to every ticket a 44 px target, like the ticket links', async () => {
    const root = await render();

    const link = root.querySelector<HTMLAnchorElement>('a.all-link');
    expect(link?.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
  });

  it('links each id to that ticket on /tickets and names it', async () => {
    const root = await render();

    const link = root.querySelector<HTMLAnchorElement>('a.ticket-link');
    expect(link?.getAttribute('href')).toBe('/tickets?id=WJ-1');
    expect(link?.textContent.trim()).toBe('WJ-1');
    expect(link?.getAttribute('aria-label')).toBe('WJ-1, Printer jams');
  });

  it('shows the requester as named initials and priority and status as text tags', async () => {
    const root = await render();

    const avatar = root.querySelector('wj-avatar');
    expect(avatar?.textContent.trim()).toBe('AE');
    expect(avatar?.querySelector('[aria-label]')?.getAttribute('aria-label')).toBe('Ada Example');
    const tags = Array.from(root.querySelectorAll('wj-tag')).map((tag) => tag.textContent.trim());
    expect(tags).toEqual(['Urgent', 'Open', 'Low', 'Resolved']);
  });
});
