import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { WjButton } from 'weeljack-ng/button';
import { WjIcon, wjIconChartColumn } from 'weeljack-ng/icon';
import { STATUS_LABEL, TicketStatus, WeeklyStatus } from '../../../data/models';
import { AppChart, ChartSeries } from '../../../ui/chart/chart';

/**
 * The `--wj-*` property that colours each status. The first is the theme's primary; the others are
 * mid-scale shades that keep 3:1 against the panel in both schemes.
 */
const STATUS_COLOR: Readonly<Record<TicketStatus, string>> = {
  open: '--wj-primary-color',
  'in-progress': '--wj-sky-600',
  waiting: '--wj-amber-700',
  resolved: '--wj-green-700',
};

/**
 * Tickets by status per week as a stacked bar chart, with the same numbers in a table. The table
 * is always in the document (so the prerendered page carries it) and hidden until the toggle
 * shows it; it is also what the chart's canvas points at as its description.
 */
@Component({
  selector: 'wjt-status-chart',
  imports: [AppChart, WjButton, WjIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'card' },
  templateUrl: './status-chart.html',
  styleUrl: './status-chart.css',
})
export class StatusChart {
  readonly status = input.required<WeeklyStatus>();

  protected readonly tableId = 'status-table';
  protected readonly icon = wjIconChartColumn;
  protected readonly shown = signal(false);
  /** `aria-controls` is not an input of `wj-button`: it goes on its button through `pt`. */
  protected readonly togglePt = { root: { 'aria-controls': this.tableId } };

  protected readonly series = computed<readonly ChartSeries[]>(() =>
    this.status().series.map((item) => ({
      label: STATUS_LABEL[item.status],
      values: item.values,
      colorVar: STATUS_COLOR[item.status],
    })),
  );

  protected toggle(): void {
    this.shown.update((shown) => !shown);
  }
}
