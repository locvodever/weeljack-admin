import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { LayoutService } from '../../layout/layout.service';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Legend, Tooltip);

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

/** One stack of the chart: its legend label, one value per label, and the `--wj-*` property that colours it. */
export interface ChartSeries {
  readonly label: string;
  readonly values: readonly number[];
  /** A custom property name such as `--wj-primary-color`, read on the chart's host. */
  readonly colorVar: string;
}

/** Every colour the chart draws with, read from the theme. */
interface Palette {
  readonly series: readonly string[];
  readonly text: string;
  readonly muted: string;
  readonly grid: string;
  readonly surface: string;
  readonly font: string;
}

/**
 * A stacked bar chart over Chart.js, themed from `--wj-*` custom properties. It draws only in the
 * browser, after the first render, so a prerendered page holds an empty canvas and the app puts a
 * data table beside it. The canvas is an image named by `ariaLabel` and described by the element
 * `ariaDescribedBy` points at.
 *
 * It never owns theme state. It re-reads its colours when the layout service's preset, surface or
 * scheme changes, and also when `<head>` or `<html class>` changes, because a lazy preset applies
 * its styles after the signal has moved. The chart updates only when what it would draw differs.
 * Animation is off while the reader prefers reduced motion.
 */
@Component({
  selector: 'wjt-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chart.html',
  styleUrl: './chart.css',
})
export class AppChart {
  readonly labels = input.required<readonly string[]>();
  readonly series = input.required<readonly ChartSeries[]>();
  /** The canvas's accessible name. */
  readonly ariaLabel = input.required<string>();
  /** The id of the element that describes the chart, such as its data table. */
  readonly ariaDescribedBy = input.required<string>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private readonly layout = inject(LayoutService);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  private readonly chart = signal<Chart<'bar'> | undefined>(undefined);
  private readonly reduceMotion = signal(false);
  /** What the chart currently shows, so an update that would change nothing is skipped. */
  private drawn = '';

  constructor() {
    const destroyRef = inject(DestroyRef);

    effect(() => {
      const chart = this.chart();
      this.labels();
      this.series();
      this.reduceMotion();
      this.layout.preset();
      this.layout.surface();
      this.layout.scheme();
      if (chart !== undefined) {
        untracked(() => {
          this.sync(chart);
        });
      }
    });

    afterNextRender(() => {
      const win = this.document.defaultView;
      if (win === null) {
        return;
      }

      const motion = win.matchMedia(REDUCED_MOTION);
      this.reduceMotion.set(motion.matches);
      const onMotion = (event: MediaQueryListEvent): void => {
        this.reduceMotion.set(event.matches);
      };
      motion.addEventListener('change', onMotion);

      const { key, data, options } = this.snapshot();
      this.drawn = key;
      const chart = new Chart(this.canvas().nativeElement, { type: 'bar', data, options });
      this.chart.set(chart);

      const observer = new MutationObserver(() => {
        this.sync(chart);
      });
      observer.observe(this.document.head, { childList: true, characterData: true, subtree: true });
      observer.observe(this.document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
      });

      destroyRef.onDestroy(() => {
        observer.disconnect();
        motion.removeEventListener('change', onMotion);
        chart.destroy();
      });
    });
  }

  /** Redraws with the colours and data now in effect, unless they are the ones already drawn. */
  private sync(chart: Chart<'bar'>): void {
    const { key, data, options } = this.snapshot();
    if (key === this.drawn) {
      return;
    }
    this.drawn = key;
    chart.data = data;
    chart.options = options;
    chart.update('none');
  }

  private snapshot(): {
    key: string;
    data: ChartData<'bar'>;
    options: ChartOptions<'bar'>;
  } {
    const palette = this.palette();
    const labels = [...this.labels()];
    const series = this.series();
    const reduce = this.reduceMotion();

    const data: ChartData<'bar'> = {
      labels,
      datasets: series.map((item, index) => ({
        label: item.label,
        data: [...item.values],
        backgroundColor: palette.series[index],
        borderColor: palette.surface,
        borderWidth: 1,
      })),
    };
    const options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      animation: reduce ? false : { duration: 600 },
      font: { family: palette.font },
      scales: {
        x: { stacked: true, grid: { display: false }, ticks: { color: palette.muted } },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { color: palette.grid },
          ticks: { color: palette.muted, precision: 0 },
        },
      },
      plugins: { legend: { position: 'bottom', labels: { color: palette.text } } },
    };
    return { key: JSON.stringify([palette, labels, series, reduce]), data, options };
  }

  private palette(): Palette {
    const style = getComputedStyle(this.host.nativeElement);
    const read = (name: string): string => style.getPropertyValue(name).trim() || style.color;
    return {
      series: this.series().map((item) => read(item.colorVar)),
      text: read('--wj-text-color'),
      muted: read('--wj-text-muted-color'),
      grid: read('--wj-content-border-color'),
      surface: read('--wj-content-background'),
      font: style.fontFamily,
    };
  }
}
