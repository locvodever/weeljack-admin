import { TestBed } from '@angular/core/testing';
import { provideWeeljack } from 'weeljack-ng';
import { wjPolice } from 'weeljack-ng/preset-police';
import { describe, expect, it } from 'vitest';
import type { Stat } from '../../../data/models';
import { StatCards } from './stat-cards';

const STATS: readonly Stat[] = [
  { id: 'open', label: 'Open tickets', value: '22', delta: 'Up 4 since yesterday' },
  { id: 'sla', label: 'Breaching SLA today', value: '3', delta: 'Down 2 since yesterday' },
  { id: 'response', label: 'Median first response', value: '14 min', delta: 'Unchanged' },
  { id: 'csat', label: 'Satisfaction', value: '94%', delta: 'Up 1 point' },
];

describe('StatCards', () => {
  async function render() {
    TestBed.configureTestingModule({
      providers: [provideWeeljack({ preset: wjPolice, darkMode: 'class' })],
    });
    const fixture = TestBed.createComponent(StatCards);
    fixture.componentRef.setInput('stats', STATS);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders a card per stat with its label, value and delta in words', async () => {
    const root = await render();

    const cards = Array.from(root.querySelectorAll('li'));
    expect(cards.length).toBe(4);
    expect(cards.map((card) => card.querySelector('.value')?.textContent.trim())).toEqual([
      '22',
      '3',
      '14 min',
      '94%',
    ]);
    expect(cards[0]?.querySelector('.label')?.textContent.trim()).toBe('Open tickets');
    expect(cards[0]?.querySelector('.delta')?.textContent.trim()).toBe('Up 4 since yesterday');
  });

  it('names the section and draws every icon as a decoration', async () => {
    const root = await render();

    expect(root.querySelector('h2')?.textContent.trim()).toBe('Today at a glance');
    const icons = Array.from(root.querySelectorAll('svg'));
    expect(icons.length).toBe(4);
    for (const icon of icons) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }
    expect(root.querySelector('svg.inbox')?.getAttribute('focusable')).toBe('false');
  });
});
