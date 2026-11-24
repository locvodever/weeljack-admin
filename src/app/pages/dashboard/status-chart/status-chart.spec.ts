import { TestBed } from '@angular/core/testing';
import { provideWeeljack } from 'weeljack-ng';
import { wjPolice } from 'weeljack-ng/preset-police';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { WeeklyStatus } from '../../../data/models';
import { resetLayoutEnvironment } from '../../../layout/testing/environment';
import { StatusChart } from './status-chart';

const STATUS: WeeklyStatus = {
  weeks: ['Oct 12', 'Oct 19'],
  series: [
    { status: 'open', values: [9, 11] },
    { status: 'resolved', values: [31, 34] },
  ],
};

describe('StatusChart', () => {
  beforeEach(() => {
    resetLayoutEnvironment();
    TestBed.configureTestingModule({
      providers: [provideWeeljack({ preset: wjPolice, darkMode: 'class' })],
    });
  });

  afterEach(() => {
    resetLayoutEnvironment();
  });

  async function render() {
    const fixture = TestBed.createComponent(StatusChart);
    fixture.componentRef.setInput('status', STATUS);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return { fixture, root, toggle: root.querySelector<HTMLButtonElement>('wj-button button') };
  }

  it('keeps the data table in the document but hidden until the toggle shows it', async () => {
    const { fixture, root, toggle } = await render();

    const table = root.querySelector<HTMLTableElement>('table');
    expect(table?.hidden).toBe(true);
    expect(toggle?.textContent.trim()).toBe('Show data table');
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(toggle?.getAttribute('aria-controls')).toBe(table?.id);

    toggle?.click();
    await fixture.whenStable();
    expect(table?.hidden).toBe(false);
    expect(toggle?.textContent.trim()).toBe('Hide data table');
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
  });

  it('holds the same numbers as the chart, with a caption and headers', async () => {
    const { root } = await render();

    expect(root.querySelector('caption')?.textContent).toContain('Tickets by status per week');
    const head = Array.from(root.querySelectorAll('thead th')).map((th) => th.textContent.trim());
    expect(head).toEqual(['Week of', 'Open', 'Resolved']);
    const rows = Array.from(root.querySelectorAll('tbody tr')).map((tr) =>
      Array.from(tr.children).map((cell) => cell.textContent.trim()),
    );
    expect(rows).toEqual([
      ['Oct 12', '9', '31'],
      ['Oct 19', '11', '34'],
    ]);
  });

  it('describes the chart canvas with the table', async () => {
    const { root } = await render();

    const canvas = root.querySelector('canvas');
    expect(canvas?.getAttribute('role')).toBe('img');
    expect(canvas?.getAttribute('aria-label')).toBe('Tickets by status per week');
    expect(canvas?.getAttribute('aria-describedby')).toBe(root.querySelector('table')?.id);
  });
});
