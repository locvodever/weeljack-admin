import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { WjButton } from 'weeljack-ng/button';
import { WjIcon, wjIconDownload, wjIconPlus, wjIconSearch, wjIconTrash } from 'weeljack-ng/icon';
import { WjIconField } from 'weeljack-ng/iconfield';
import { WjInputIcon } from 'weeljack-ng/inputicon';
import { WjInputText } from 'weeljack-ng/inputtext';
import { WjToolbar } from 'weeljack-ng/toolbar';

/**
 * The actions above the tickets table: New, Delete selected (off while nothing is selected),
 * Export CSV and the global search. It holds no state of its own; the page decides what each does.
 */
@Component({
  selector: 'wjt-tickets-toolbar',
  imports: [WjButton, WjIcon, WjIconField, WjInputIcon, WjInputText, WjToolbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tickets-toolbar.html',
  styleUrl: './tickets-toolbar.css',
})
export class TicketsToolbar {
  /** The search text. */
  readonly search = input.required<string>();
  /** How many tickets are selected. */
  readonly selectedCount = input.required<number>();

  readonly create = output();
  readonly removeSelected = output();
  readonly exportCsv = output();
  readonly searchChange = output<string>();

  protected readonly icons = {
    plus: wjIconPlus,
    trash: wjIconTrash,
    download: wjIconDownload,
    search: wjIconSearch,
  };

  protected onSearch(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.searchChange.emit(event.target.value);
    }
  }
}
