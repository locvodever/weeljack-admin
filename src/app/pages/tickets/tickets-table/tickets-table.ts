import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  model,
  output,
  viewChild,
} from '@angular/core';
import type { WjSortOrder } from 'weeljack-ng';
import { WjAvatar } from 'weeljack-ng/avatar';
import { WjButton } from 'weeljack-ng/button';
import { WjIcon, wjIconPencil, wjIconTrash } from 'weeljack-ng/icon';
import { WjColumn, WjTable, WjTableCellSlot, WjTableEmptySlot } from 'weeljack-ng/table';
import { WjTag } from 'weeljack-ng/tag';
import { PRIORITY_LABEL, STATUS_LABEL, Ticket, initials } from '../../../data/models';
import { relativeTime } from '../../../data/demo-time';
import { PRIORITY_SEVERITY, STATUS_SEVERITY } from '../../../data/ticket-tags';

/**
 * The tickets as a `wj-table`: selectable, sortable on every data column and paged by its own pager
 * ("Showing 1 to 10 of 32"). It gets the full filtered and sorted list as `value`, so sort and the
 * page report see every ticket. Selection, sort and page are `model`s the page owns; Edit and
 * Delete are reported as events. The table sits in a focusable `role="region"`, so a keyboard can
 * scroll it sideways when the panel is narrower than its columns.
 */
@Component({
  selector: 'app-tickets-table',
  imports: [
    WjAvatar,
    WjButton,
    WjColumn,
    WjIcon,
    WjTable,
    WjTableCellSlot,
    WjTableEmptySlot,
    WjTag,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tickets-table.html',
  styleUrl: './tickets-table.css',
})
export class TicketsTable {
  /** Every ticket to show, already filtered and sorted. */
  readonly tickets = input.required<readonly Ticket[]>();

  readonly selection = model<Ticket[]>([]);
  readonly sortField = model<string | undefined>();
  readonly sortOrder = model<WjSortOrder>(1);
  readonly first = model(0);
  readonly rows = model<number | undefined>(10);

  readonly edit = output<Ticket>();
  readonly remove = output<Ticket>();

  private readonly region = viewChild.required<ElementRef<HTMLElement>>('region');

  protected readonly pageSizes = [10, 20, 50];
  protected readonly icons = { edit: wjIconPencil, remove: wjIconTrash };
  protected readonly initials = initials;
  protected readonly relativeTime = relativeTime;
  protected readonly priorityLabel = PRIORITY_LABEL;
  protected readonly prioritySeverity = PRIORITY_SEVERITY;
  protected readonly statusLabel = STATUS_LABEL;
  protected readonly statusSeverity = STATUS_SEVERITY;

  /** Focuses the Edit button of ticket `id` if its row is on the page; returns whether it was. */
  focusEdit(id: string): boolean {
    const button = this.region().nativeElement.querySelector<HTMLElement>(
      `button[aria-label="Edit ticket ${id}"]`,
    );
    button?.focus();
    return button !== null;
  }

  /** Moves focus to the table's scroll region, for when the control that had it is gone. */
  focusRegion(): void {
    this.region().nativeElement.focus();
  }
}
