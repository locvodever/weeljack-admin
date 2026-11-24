import { TestBed } from '@angular/core/testing';
import { provideWeeljack } from 'weeljack-ng';
import { wjPolice } from 'weeljack-ng/preset-police';
import { describe, expect, it } from 'vitest';
import type { Ticket } from '../../../data/models';
import { TicketsTable } from './tickets-table';

const TICKETS: readonly Ticket[] = [
  {
    id: 'WJ-1',
    subject: 'Printer jams',
    requester: 'Ada Example',
    priority: 'urgent',
    status: 'open',
    assignee: 'Agent One',
    created: '2026-11-20T08:00:00.000Z',
    updated: '2026-11-24T08:00:00.000Z',
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

async function render(tickets: readonly Ticket[]) {
  TestBed.configureTestingModule({
    providers: [provideWeeljack({ preset: wjPolice, darkMode: 'class' })],
  });
  const fixture = TestBed.createComponent(TicketsTable);
  fixture.componentRef.setInput('tickets', tickets);
  await fixture.whenStable();
  return { fixture, root: fixture.nativeElement as HTMLElement };
}

describe('TicketsTable', () => {
  it('shows named columns, tags, a named avatar and the pager report', async () => {
    const { root } = await render(TICKETS);

    const headers = Array.from(root.querySelectorAll('th')).map((th) => th.textContent.trim());
    expect(headers).toEqual([
      '',
      'Ticket',
      'Subject',
      'Requester',
      'Priority',
      'Status',
      'Assignee',
      'Updated',
      'Actions',
    ]);
    expect(root.querySelectorAll('tbody tr').length).toBe(2);
    expect(root.querySelector('wj-avatar [aria-label]')?.getAttribute('aria-label')).toBe(
      'Ada Example',
    );
    const tags = Array.from(root.querySelectorAll('wj-tag')).map((tag) => tag.textContent.trim());
    expect(tags).toEqual(['Urgent', 'Open', 'Low', 'Resolved']);
    expect(root.textContent).toContain('Showing 1 to 2 of 2');
  });

  it('puts the table in a focusable, named region', async () => {
    const { root } = await render(TICKETS);

    const region = root.querySelector('[role="region"]');
    expect(region?.getAttribute('tabindex')).toBe('0');
    expect(region?.getAttribute('aria-label')).toBe('Ticket list');
  });

  it('emits the ticket from its named Edit and Delete buttons', async () => {
    const { fixture, root } = await render(TICKETS);
    const seen: string[] = [];
    fixture.componentInstance.edit.subscribe((ticket) => seen.push(`edit ${ticket.id}`));
    fixture.componentInstance.remove.subscribe((ticket) => seen.push(`remove ${ticket.id}`));

    root.querySelector<HTMLElement>('button[aria-label="Edit ticket WJ-2"]')?.click();
    root.querySelector<HTMLElement>('button[aria-label="Delete ticket WJ-1"]')?.click();

    expect(seen).toEqual(['edit WJ-2', 'remove WJ-1']);
  });

  it('says "No tickets match" for no rows', async () => {
    const { root } = await render([]);

    expect(root.querySelector('tbody')?.textContent.trim()).toBe('No tickets match');
  });

  it('moves focus to the region or to a row Edit button on request', async () => {
    const { fixture, root } = await render(TICKETS);
    document.body.append(root);

    expect(fixture.componentInstance.focusEdit('WJ-1')).toBe(true);
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Edit ticket WJ-1');
    expect(fixture.componentInstance.focusEdit('WJ-99')).toBe(false);
    fixture.componentInstance.focusRegion();
    expect(document.activeElement).toBe(root.querySelector('[role="region"]'));
    root.remove();
  });
});
