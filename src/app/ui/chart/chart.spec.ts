import { TestBed } from '@angular/core/testing';
import { Chart } from 'chart.js';
import { provideWeeljack } from 'weeljack-ng';
import { wjPolice } from 'weeljack-ng/preset-police';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LayoutService } from '../../layout/layout.service';
import { resetLayoutEnvironment } from '../../layout/testing/environment';
import { AppChart, ChartSeries } from './chart';

const SERIES: readonly ChartSeries[] = [
  { label: 'Open', values: [1, 2, 3], colorVar: '--wj-primary-color' },
  { label: 'Done', values: [4, 5, 6], colorVar: '--wj-green-700' },
];

/** A `matchMedia` where only the reduced-motion query is answered, by a target a spec can fire on. */
function stubReducedMotion(matches: boolean): EventTarget {
  const target = new EventTarget();
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) =>
    Object.assign(target, {
      matches: query === '(prefers-reduced-motion: reduce)' ? matches : false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
    }),
  );
  return target;
}

describe('AppChart', () => {
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
    const fixture = TestBed.createComponent(AppChart);
    fixture.componentRef.setInput('labels', ['Oct 12', 'Oct 19', 'Oct 26']);
    fixture.componentRef.setInput('series', SERIES);
    fixture.componentRef.setInput('ariaLabel', 'Tickets by status per week');
    fixture.componentRef.setInput('ariaDescribedBy', 'status-table');
    await fixture.whenStable();
    const canvas = (fixture.nativeElement as HTMLElement).querySelector('canvas');
    if (canvas === null) {
      throw new Error('no canvas');
    }
    const chart = Chart.getChart(canvas);
    if (chart === undefined) {
      throw new Error('no chart');
    }
    return { fixture, layout: TestBed.inject(LayoutService), canvas, chart };
  }

  it('names the canvas and points it at its description', async () => {
    const { canvas } = await render();

    expect(canvas.getAttribute('role')).toBe('img');
    expect(canvas.getAttribute('aria-label')).toBe('Tickets by status per week');
    expect(canvas.getAttribute('aria-describedby')).toBe('status-table');
  });

  it('draws a stacked bar per series, coloured from the theme', async () => {
    const { chart } = await render();

    expect(chart.getDatasetMeta(0).type).toBe('bar');
    expect(chart.data.labels).toEqual(['Oct 12', 'Oct 19', 'Oct 26']);
    expect(chart.data.datasets.map((set) => set.label)).toEqual(['Open', 'Done']);
    expect(chart.data.datasets.map((set) => set.data)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    expect(chart.data.datasets[0]?.backgroundColor).toBe('#1e3a8a');
    expect(chart.data.datasets[1]?.backgroundColor).toBe('#15803d');
    const y = chart.options.scales?.['y'];
    expect(y !== undefined && 'stacked' in y && y.stacked).toBe(true);
  });

  it('redraws in the new colours when the scheme changes, and only then', async () => {
    const { fixture, layout, chart } = await render();
    const update = vi.spyOn(chart, 'update');

    layout.setScheme('dark');
    await fixture.whenStable();
    expect(chart.data.datasets[0]?.backgroundColor).toBe('#93c5fd');
    expect(update).toHaveBeenCalledTimes(1);

    // Nothing the chart draws differs, so the same colours do not redraw it.
    await layout.setSurface('slate');
    await fixture.whenStable();
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('redraws once a lazy preset has applied its styles', async () => {
    const { fixture, layout, chart } = await render();
    expect(chart.data.datasets[0]?.backgroundColor).toBe('#1e3a8a');

    try {
      await layout.setPreset('aura');
      await fixture.whenStable();
      expect(chart.data.datasets[0]?.backgroundColor).toBe('#047857');
    } finally {
      await layout.setPreset('police');
    }
  });

  it('animates by default', async () => {
    const { chart } = await render();

    expect(chart.options.animation).not.toBe(false);
  });

  it('does not animate under reduced motion', async () => {
    stubReducedMotion(true);
    const { chart } = await render();

    expect(chart.options.animation).toBe(false);
  });

  it('follows a change of the reduced-motion preference', async () => {
    const query = stubReducedMotion(true);
    const { fixture, chart } = await render();
    expect(chart.options.animation).toBe(false);

    query.dispatchEvent(Object.assign(new Event('change'), { matches: false }));
    await fixture.whenStable();
    expect(chart.options.animation).not.toBe(false);
  });

  it('destroys the chart with the component', async () => {
    const { fixture, canvas } = await render();

    fixture.destroy();

    expect(Chart.getChart(canvas)).toBeUndefined();
  });
});
