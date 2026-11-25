import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { DEMO_NOW } from './demo-time';
import type { TicketDraft } from './models';
import { TicketService } from './ticket.service';
import { TicketStore } from './ticket-store';

const DRAFT: TicketDraft = {
  subject: 'Badge reader offline',
  description: 'Front door, since 9.',
  requester: 'Ada Example',
  priority: 'high',
  status: 'open',
  assignee: 'Mara Okafor',
};

describe('TicketStore', () => {
  it('starts with the mock tickets', () => {
    const store = TestBed.inject(TicketStore);

    expect(store.all()).toEqual(TestBed.inject(TicketService).all);
  });

  it('never reuses an id: deleting the highest tickets does not lower the next one', () => {
    const store = TestBed.inject(TicketStore);

    expect(store.remove(['WJ-1030', 'WJ-1031', 'WJ-1032'])).toBe(3);
    const created = store.create(DRAFT);
    expect(created.id).toBe('WJ-1033');

    store.remove([created.id]);
    expect(store.create(DRAFT).id).toBe('WJ-1034');
  });

  it('creates a ticket under the next id, dated at the demo anchor', () => {
    const store = TestBed.inject(TicketStore);
    const before = store.all().length;

    const ticket = store.create(DRAFT);

    expect(ticket.id).toBe('WJ-1033');
    expect(ticket.created).toBe(new Date(DEMO_NOW).toISOString());
    expect(ticket.updated).toBe(ticket.created);
    expect(ticket.description).toBe('Front door, since 9.');
    expect(store.all().length).toBe(before + 1);
    expect(store.create(DRAFT).id).toBe('WJ-1034');
  });

  it('updates the form fields, stamps updated and keeps id and created', () => {
    const store = TestBed.inject(TicketStore);
    const original = store.all()[0];
    if (original === undefined) {
      throw new Error('no mock tickets');
    }

    const next = store.update(original.id, DRAFT);

    expect(next).toMatchObject({ ...DRAFT, id: original.id, created: original.created });
    expect(next?.updated).toBe(new Date(DEMO_NOW).toISOString());
    expect(store.all().find((ticket) => ticket.id === original.id)).toBe(next);
    expect(store.update('WJ-0', DRAFT)).toBeUndefined();
  });

  it('removes tickets by id and reports how many went', () => {
    const store = TestBed.inject(TicketStore);
    const before = store.all().length;

    expect(store.remove(['WJ-1001', 'WJ-1002', 'WJ-9999'])).toBe(2);

    expect(store.all().length).toBe(before - 2);
    expect(store.all().some((ticket) => ticket.id === 'WJ-1001')).toBe(false);
  });

  it('leaves the read-only TicketService untouched', () => {
    const store = TestBed.inject(TicketStore);
    const service = TestBed.inject(TicketService);
    const before = service.all.length;

    store.create(DRAFT);
    store.remove(['WJ-1001']);

    expect(service.all.length).toBe(before);
  });
});
