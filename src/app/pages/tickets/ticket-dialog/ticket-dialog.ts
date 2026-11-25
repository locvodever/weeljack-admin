import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WjButton } from 'weeljack-ng/button';
import { WjDialog, WjDialogFooterSlot } from 'weeljack-ng/dialog';
import { WjField } from 'weeljack-ng/field';
import { WjInputText } from 'weeljack-ng/inputtext';
import { WjRadioButton } from 'weeljack-ng/radiobutton';
import { WjSelect, WjSelectOption } from 'weeljack-ng/select';
import { WjTextarea } from 'weeljack-ng/textarea';
import { AgentService } from '../../../data/agent.service';
import {
  PRIORITY_LABEL,
  STATUS_LABEL,
  Ticket,
  TicketDraft,
  TicketPriority,
  TicketStatus,
} from '../../../data/models';

const PRIORITIES: readonly TicketPriority[] = ['low', 'normal', 'high', 'urgent'];
const STATUSES: readonly TicketStatus[] = ['open', 'in-progress', 'waiting', 'resolved'];

/**
 * The ticket form in a modal `wj-dialog`: "New ticket" with no `ticket`, "Edit ticket WJ-..." with
 * one. Subject and requester are required: Save with either blank keeps the dialog open, shows
 * "Enter a subject" / "Enter a requester" and moves focus to the first invalid field (subject
 * before requester); a valid Save emits the trimmed draft and closes. Cancel, the close button and
 * Escape close it without saving, and the dialog returns focus to the control that opened it.
 */
@Component({
  selector: 'app-ticket-dialog',
  imports: [
    FormsModule,
    WjButton,
    WjDialog,
    WjDialogFooterSlot,
    WjField,
    WjInputText,
    WjRadioButton,
    WjSelect,
    WjTextarea,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ticket-dialog.html',
  styleUrl: './ticket-dialog.css',
})
export class TicketDialog {
  /** The ticket being edited, or `null` for a new one. */
  readonly ticket = input<Ticket | null>(null);
  readonly visible = model(false);
  readonly save = output<TicketDraft>();
  /** Emitted once the dialog is gone, whatever closed it. */
  readonly closed = output();

  private readonly agents = inject(AgentService);
  private readonly subjectInput = viewChild<ElementRef<HTMLInputElement>>('subjectInput');
  private readonly requesterInput = viewChild<ElementRef<HTMLInputElement>>('requesterInput');

  protected readonly subject = signal('');
  protected readonly description = signal('');
  protected readonly requester = signal('');
  protected readonly priority = signal<TicketPriority>('normal');
  protected readonly status = signal<TicketStatus>('open');
  protected readonly assignee = signal('');
  /** Set by the first Save, so the error never shows before the reader tried. */
  private readonly submitted = signal(false);

  protected readonly heading = computed(() => {
    const ticket = this.ticket();
    return ticket === null ? 'New ticket' : `Edit ticket ${ticket.id}`;
  });
  protected readonly subjectError = computed(() =>
    this.submitted() && this.subject().trim() === '' ? 'Enter a subject' : undefined,
  );
  /** A requester is required: the table shows them as an initials avatar named for the person. */
  protected readonly requesterError = computed(() =>
    this.submitted() && this.requester().trim() === '' ? 'Enter a requester' : undefined,
  );

  protected readonly priorities = PRIORITIES.map((value) => ({
    value,
    label: PRIORITY_LABEL[value],
  }));
  protected readonly statusOptions: WjSelectOption<TicketStatus>[] = STATUSES.map((value) => ({
    value,
    label: STATUS_LABEL[value],
  }));
  protected readonly assigneeOptions: WjSelectOption<string>[] = this.agents.all.map((agent) => ({
    value: agent.name,
    label: agent.name,
  }));

  constructor() {
    // Each time the dialog opens the form starts from the ticket (or blank), never from the last edit.
    effect(() => {
      if (this.visible()) {
        untracked(() => {
          this.fill(this.ticket());
        });
      }
    });
  }

  protected setPriority(value: TicketPriority | null): void {
    this.priority.set(value ?? this.priority());
  }

  protected setStatus(value: TicketStatus | null): void {
    this.status.set(value ?? this.status());
  }

  protected setAssignee(value: string | null): void {
    this.assignee.set(value ?? this.assignee());
  }

  protected submit(): void {
    this.submitted.set(true);
    // Focus goes to the first invalid field in reading order.
    if (this.subjectError() !== undefined) {
      this.subjectInput()?.nativeElement.focus();
      return;
    }
    if (this.requesterError() !== undefined) {
      this.requesterInput()?.nativeElement.focus();
      return;
    }
    this.save.emit({
      subject: this.subject().trim(),
      description: this.description().trim(),
      requester: this.requester().trim(),
      priority: this.priority(),
      status: this.status(),
      assignee: this.assignee(),
    });
    this.visible.set(false);
  }

  protected cancel(): void {
    this.visible.set(false);
  }

  private fill(ticket: Ticket | null): void {
    this.submitted.set(false);
    this.subject.set(ticket?.subject ?? '');
    this.description.set(ticket?.description ?? '');
    this.requester.set(ticket?.requester ?? '');
    this.priority.set(ticket?.priority ?? 'normal');
    this.status.set(ticket?.status ?? 'open');
    this.assignee.set(ticket?.assignee ?? this.assigneeOptions[0]?.value ?? '');
  }
}
