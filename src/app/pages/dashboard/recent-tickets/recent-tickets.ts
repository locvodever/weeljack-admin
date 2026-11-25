import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WjAvatar } from 'weeljack-ng/avatar';
import { WjColumn, WjTable, WjTableCellSlot } from 'weeljack-ng/table';
import { WjTag } from 'weeljack-ng/tag';
import { PRIORITY_LABEL, STATUS_LABEL, Ticket, initials } from '../../../data/models';
import { PRIORITY_SEVERITY, STATUS_SEVERITY } from '../../../data/ticket-tags';

/**
 * The latest tickets as a `wj-table`: each id links to that ticket on the tickets page, the
 * requester is an initials avatar named for the person, and priority and status are tags whose
 * text says what the colour means.
 */
@Component({
  selector: 'app-recent-tickets',
  imports: [RouterLink, WjAvatar, WjColumn, WjTable, WjTableCellSlot, WjTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'card' },
  templateUrl: './recent-tickets.html',
  styleUrl: './recent-tickets.css',
})
export class RecentTickets {
  readonly tickets = input.required<readonly Ticket[]>();

  protected readonly initials = initials;
  protected readonly priorityLabel = PRIORITY_LABEL;
  protected readonly prioritySeverity = PRIORITY_SEVERITY;
  protected readonly statusLabel = STATUS_LABEL;
  protected readonly statusSeverity = STATUS_SEVERITY;
}
