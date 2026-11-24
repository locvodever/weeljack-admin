import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { WjConfirmationService, type WjSortOrder } from 'weeljack-ng';
import { WjConfirmDialog } from 'weeljack-ng/confirmdialog';
import { WjToast, WjToastService } from 'weeljack-ng/toast';
import { PRIORITY_LABEL, STATUS_LABEL, type Ticket, type TicketDraft } from '../../data/models';
import { TicketStore } from '../../data/ticket-store';
import { downloadCsv, toCsv, type CsvColumn } from '../../ui/csv/csv';
import { TicketDialog } from './ticket-dialog/ticket-dialog';
import { filterTickets, sortTickets } from './ticket-query';
import { TicketsTable } from './tickets-table/tickets-table';
import { TicketsToolbar } from './tickets-toolbar/tickets-toolbar';

/** The export has the table's columns; "Updated" is the ISO instant, which a spreadsheet can read. */
const CSV_COLUMNS: readonly CsvColumn<Ticket>[] = [
  { header: 'Ticket', value: (ticket) => ticket.id },
  { header: 'Subject', value: (ticket) => ticket.subject },
  { header: 'Requester', value: (ticket) => ticket.requester },
  { header: 'Priority', value: (ticket) => PRIORITY_LABEL[ticket.priority] },
  { header: 'Status', value: (ticket) => STATUS_LABEL[ticket.status] },
  { header: 'Assignee', value: (ticket) => ticket.assignee },
  { header: 'Updated', value: (ticket) => ticket.updated },
];

/**
 * The tickets page at `/tickets`: search, sort, page, create, edit, delete and export over the
 * in-memory `TicketStore`. The page owns the search, the sort, the selection and the dialog as
 * signals, and one computed filtered and sorted list that is both the table's rows and the CSV
 * source. The dashboard's `?id=` and `?assignee=` links pre-fill the search once. The confirm and
 * the toast are hosted here, so their code stays in this lazy chunk.
 */
@Component({
  selector: 'app-tickets',
  imports: [TicketDialog, TicketsTable, TicketsToolbar, WjConfirmDialog, WjToast],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
})
export class Tickets {
  private readonly store = inject(TicketStore);
  private readonly toast = inject(WjToastService);
  private readonly confirmation = inject(WjConfirmationService);
  private readonly table = viewChild.required(TicketsTable);

  protected readonly search = signal(this.initialSearch());
  protected readonly sortField = signal<string | undefined>('updated');
  protected readonly sortOrder = signal<WjSortOrder>(-1);
  protected readonly selection = signal<Ticket[]>([]);
  protected readonly first = signal(0);
  protected readonly pageSize = signal<number | undefined>(10);
  protected readonly dialogOpen = signal(false);
  protected readonly editing = signal<Ticket | null>(null);

  private readonly document = inject(DOCUMENT);
  /** An edited ticket whose row may have moved: its Edit button gets focus once the dialog is gone. */
  private focusAfterEdit: string | null = null;

  /** Every ticket that matches the search, in the table's sort order: what the table shows and the CSV exports. */
  protected readonly rows = computed(() =>
    sortTickets(filterTickets(this.store.all(), this.search()), this.sortField(), this.sortOrder()),
  );

  /** What a screen reader hears after a search; empty until the reader searches. */
  protected readonly matchCount = computed(() => {
    if (this.search().trim() === '') {
      return '';
    }
    const count = this.rows().length;
    return count === 1 ? '1 ticket matches' : `${count} tickets match`;
  });

  private initialSearch(): string {
    const params = inject(ActivatedRoute).snapshot.queryParamMap;
    return params.get('id') ?? params.get('assignee') ?? '';
  }

  protected onSearch(query: string): void {
    this.search.set(query);
    this.first.set(0);
    // A ticket the search hides must not stay selected: Delete selected would remove it unseen.
    const visible = new Set(this.rows().map((ticket) => ticket.id));
    this.selection.update((selected) => selected.filter((ticket) => visible.has(ticket.id)));
  }

  protected openCreate(): void {
    this.editing.set(null);
    this.dialogOpen.set(true);
  }

  protected openEdit(ticket: Ticket): void {
    this.editing.set(ticket);
    this.dialogOpen.set(true);
  }

  protected onSave(draft: TicketDraft): void {
    const target = this.editing();
    if (target === null) {
      const created = this.store.create(draft);
      this.toast.show({ severity: 'success', summary: `Ticket ${created.id} created` });
      return;
    }
    this.store.update(target.id, draft);
    this.focusAfterEdit = target.id;
    this.toast.show({ severity: 'success', summary: `Ticket ${target.id} updated` });
  }

  /**
   * The dialog returns focus to its opener once it has left, but an edit re-sorts the table, so that
   * Edit button may be a new one. A task later, if focus fell to the page, put it on the ticket's
   * Edit button (or the table when the row is on another page).
   */
  protected onDialogClosed(): void {
    const id = this.focusAfterEdit;
    this.focusAfterEdit = null;
    if (id === null) {
      return;
    }
    setTimeout(() => {
      const active = this.document.activeElement;
      if ((active === null || active === this.document.body) && !this.table().focusEdit(id)) {
        this.table().focusRegion();
      }
    });
  }

  protected confirmRemove(tickets: readonly Ticket[]): void {
    const [only] = tickets;
    if (only === undefined) {
      return;
    }
    const ids = tickets.map((ticket) => ticket.id);
    this.confirmation.confirm({
      header: 'Delete tickets',
      message:
        tickets.length === 1 ? `Delete ticket ${only.id}?` : `Delete ${tickets.length} tickets?`,
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.remove(ids);
      },
    });
  }

  protected exportCsv(): void {
    downloadCsv('tickets.csv', toCsv(this.rows(), CSV_COLUMNS));
  }

  private remove(ids: readonly string[]): void {
    const removed = this.store.remove(ids);
    const gone = new Set(ids);
    this.selection.update((selected) => selected.filter((ticket) => !gone.has(ticket.id)));
    this.keepPageInRange();
    this.toast.show({
      severity: 'success',
      summary: removed === 1 ? `Ticket ${ids[0] ?? ''} deleted` : `${removed} tickets deleted`,
    });
    // The control that asked is gone; focus the table, never <body>.
    this.table().focusRegion();
  }

  /** After deletes, a first row past the end would show an empty page: step back to the last page. */
  private keepPageInRange(): void {
    const size = this.pageSize() ?? 10;
    const lastPageStart = Math.max(0, Math.floor((this.rows().length - 1) / size) * size);
    this.first.update((first) => Math.min(first, lastPageStart));
  }
}
