import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { hoursAgo } from '../../../data/demo-time';
import type { ActivityGroup } from '../../../data/models';
import { ActivityFeed } from './activity-feed';

const GROUPS: readonly ActivityGroup[] = [
  { name: 'Today', items: [{ id: 'a', text: 'Ada replied to WJ-1.', at: hoursAgo(3) }] },
  {
    name: 'Earlier',
    items: [
      { id: 'b', text: 'Bo closed WJ-2.', at: hoursAgo(55) },
      { id: 'c', text: 'Cy opened WJ-3.', at: hoursAgo(80) },
    ],
  },
];

describe('ActivityFeed', () => {
  it('puts each group under its heading with its items and relative times', async () => {
    const fixture = TestBed.createComponent(ActivityFeed);
    fixture.componentRef.setInput('groups', GROUPS);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h2')?.textContent.trim()).toBe('Activity');
    expect(Array.from(root.querySelectorAll('h3')).map((h) => h.textContent.trim())).toEqual([
      'Today',
      'Earlier',
    ]);
    const lists = Array.from(root.querySelectorAll('ul'));
    expect(lists.map((list) => list.querySelectorAll('li').length)).toEqual([1, 2]);
    expect(lists[0]?.querySelector('.text')?.textContent.trim()).toBe('Ada replied to WJ-1.');
    expect(lists[0]?.querySelector('.time')?.textContent.trim()).toBe('3 h ago');
    for (const icon of Array.from(root.querySelectorAll('svg'))) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
