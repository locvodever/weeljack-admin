import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideWeeljack } from 'weeljack-ng';
import { WjButtonHarness } from 'weeljack-ng/button/testing';
import { WjConfirmDialogHarness } from 'weeljack-ng/confirmdialog/testing';
import { WjDialogHarness } from 'weeljack-ng/dialog/testing';
import { WjFieldHarness } from 'weeljack-ng/field/testing';
import { WjInputTextHarness } from 'weeljack-ng/inputtext/testing';
import { wjPolice } from 'weeljack-ng/preset-police';
import { WjTableHarness } from 'weeljack-ng/table/testing';
import { WjToastHarness } from 'weeljack-ng/toast/testing';
import { describe, expect, it, vi } from 'vitest';
import { TICKETS } from '../../data/tickets';
import { Tickets } from './tickets';

interface Setup {
  readonly fixture: ComponentFixture<Tickets>;
  readonly root: HTMLElement;
  readonly loader: HarnessLoader;
  readonly table: WjTableHarness;
}

async function setup(query: Record<string, string> = {}): Promise<Setup> {
  TestBed.configureTestingModule({
    providers: [
      provideWeeljack({ preset: wjPolice, darkMode: 'class' }),
      {
        provide: ActivatedRoute,
        useValue: { snapshot: { queryParamMap: convertToParamMap(query) } },
      },
    ],
  });
  const fixture = TestBed.createComponent(Tickets);
  await fixture.whenStable();
  const loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  const table = await loader.getHarness(WjTableHarness);
  return { fixture, root: fixture.nativeElement as HTMLElement, loader, table };
}

function ariaButton(root: ParentNode, name: string): HTMLButtonElement {
  const found = root.querySelector<HTMLButtonElement>(`button[aria-label="${name}"]`);
  if (found === null) {
    throw new Error(`no button named ${name}`);
  }
  return found;
}

/** Focuses then clicks, as a pointer does, so the dialog can remember its opener. */
function press(element: HTMLElement): void {
  element.focus();
  element.click();
}

function searchInput(root: HTMLElement): HTMLInputElement {
  const input = root.querySelector<HTMLInputElement>('input[aria-label="Search tickets"]');
  if (input === null) {
    throw new Error('no search input');
  }
  return input;
}

function search(root: HTMLElement, text: string): void {
  const input = searchInput(root);
  input.value = text;
  input.dispatchEvent(new Event('input'));
}

function labelled(root: HTMLElement, label: string): HTMLButtonElement {
  const found = Array.from(root.querySelectorAll('button')).find(
    (item) => item.textContent.trim() === label,
  );
  if (found === undefined) {
    throw new Error(`no button labelled ${label}`);
  }
  return found;
}

const collator = new Intl.Collator(undefined, { numeric: true });

describe('Tickets page', () => {
  it('has one h1, the in-memory note and the first ten tickets, newest update first', async () => {
    const { root, table } = await setup();

    expect(root.querySelectorAll('h1').length).toBe(1);
    expect(root.querySelector('h1')?.textContent.trim()).toBe('Tickets');
    expect(root.querySelector('.note')?.textContent).toContain('reset when you reload');
    const rows = await table.getCellTexts();
    expect(rows.length).toBe(10);
    expect(rows[0]?.[0]).toBe('WJ-1032');
    expect(await table.getReportText()).toBe('Showing 1 to 10 of 32');
    expect(await table.getSortOrder('Updated')).toBe('descending');
  });

  it('names the toolbar actions and every row action', async () => {
    const { root } = await setup();

    const labels = Array.from(root.querySelectorAll('app-tickets-toolbar button')).map((item) =>
      item.textContent.trim(),
    );
    expect(labels).toEqual(['New', 'Delete selected', 'Export CSV']);
    expect(searchInput(root)).toBeTruthy();
    expect(ariaButton(root, 'Edit ticket WJ-1032')).toBeTruthy();
    expect(ariaButton(root, 'Delete ticket WJ-1032')).toBeTruthy();
  });

  it('pages with the table report', async () => {
    const { table } = await setup();

    await table.goToNextPage();

    expect(await table.getReportText()).toBe('Showing 11 to 20 of 32');
    expect(await table.getCurrentPage()).toBe(2);
  });

  it('searches every ticket, announces the count and shows "No tickets match" for none', async () => {
    const { fixture, root, table } = await setup();

    search(root, 'printer');
    await fixture.whenStable();
    const expected = TICKETS.filter((ticket) =>
      [ticket.subject, ticket.requester, ticket.assignee, ticket.id].some((text) =>
        text.toLowerCase().includes('printer'),
      ),
    ).length;
    expect(expected).toBeGreaterThan(0);
    expect((await table.getRows()).length).toBe(expected);
    expect(root.querySelector('[role="status"]')?.textContent.trim()).toMatch(/match/);

    search(root, 'zzz-nothing');
    await fixture.whenStable();
    expect(await table.isEmpty()).toBe(true);
    expect(await table.getEmptyText()).toBe('No tickets match');
    expect(root.querySelector('[role="status"]')?.textContent.trim()).toBe('0 tickets match');
  });

  it('sorts all tickets across pages, so page 1 is the global first ten', async () => {
    const { table } = await setup();

    await table.sortBy('Subject');

    const subjects = TICKETS.map((ticket) => ticket.subject).sort(collator.compare);
    const rows = await table.getCellTexts();
    expect(rows.map((row) => row[1])).toEqual(subjects.slice(0, 10));
    expect(await table.getReportText()).toBe('Showing 1 to 10 of 32');
    await table.sortBy('Subject');
    expect((await table.getCellTexts()).map((row) => row[1])).toEqual(
      subjects.slice(-10).reverse(),
    );
  });

  it('keeps Delete selected off until a row is selected', async () => {
    const { fixture, table } = await setup();
    const remove = await TestbedHarnessEnvironment.loader(fixture).getHarness(
      WjButtonHarness.with({ label: 'Delete selected' }),
    );
    expect(await remove.isDisabled()).toBe(true);

    await table.selectRow(0);

    expect(await remove.isDisabled()).toBe(false);
  });

  it('creates a ticket through the dialog, toasts it and returns focus to New', async () => {
    const { fixture, root, loader, table } = await setup();
    const opener = labelled(root, 'New');

    press(opener);
    await fixture.whenStable();
    const dialog = await loader.getHarness(WjDialogHarness);
    expect(await dialog.getTitle()).toBe('New ticket');
    const [subject, requester] = await dialog.getAllHarnesses(WjInputTextHarness);
    await subject?.setValue('Badge reader offline');
    await requester?.setValue('Ada Example');
    await (await dialog.getHarness(WjButtonHarness.with({ label: 'Save' }))).click();
    await fixture.whenStable();

    const toast = await loader.getHarness(WjToastHarness);
    expect(await (await toast.getMessages())[0]?.getSummary()).toBe('Ticket WJ-1033 created');
    expect((await table.getCellTexts())[0]?.[0]).toBe('WJ-1033');
    expect(await table.getReportText()).toBe('Showing 1 to 10 of 33');
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(opener);
    });
  });

  it('keeps the dialog open and focuses the subject when Save finds it empty', async () => {
    const { fixture, root, loader } = await setup();

    press(labelled(root, 'New'));
    await fixture.whenStable();
    const dialog = await loader.getHarness(WjDialogHarness);
    await (await dialog.getHarness(WjButtonHarness.with({ label: 'Save' }))).click();
    await fixture.whenStable();

    expect(await dialog.isOpen()).toBe(true);
    const field = await dialog.getHarness(WjFieldHarness.with({ label: 'Subject' }));
    expect(await field.getError()).toBe('Enter a subject');
    const subject = (await dialog.getAllHarnesses(WjInputTextHarness))[0];
    expect(await subject?.isInvalid()).toBe(true);
    expect(await subject?.isFocused()).toBe(true);
  });

  it('cancels without saving and returns focus to the opener', async () => {
    const { fixture, root, loader, table } = await setup();
    const opener = labelled(root, 'New');

    press(opener);
    await fixture.whenStable();
    const dialog = await loader.getHarness(WjDialogHarness);
    await (await dialog.getHarness(WjButtonHarness.with({ label: 'Cancel' }))).click();
    await fixture.whenStable();

    expect(await table.getReportText()).toBe('Showing 1 to 10 of 32');
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(opener);
    });
  });

  it('edits a ticket filled into the dialog, toasts it and returns focus to that Edit button', async () => {
    const { fixture, root, loader, table } = await setup();
    const opener = ariaButton(root, 'Edit ticket WJ-1031');

    press(opener);
    await fixture.whenStable();
    const dialog = await loader.getHarness(WjDialogHarness);
    expect(await dialog.getTitle()).toBe('Edit ticket WJ-1031');
    const subject = (await dialog.getAllHarnesses(WjInputTextHarness))[0];
    expect(await subject?.getValue()).toBe('Projector in room B shows a pink tint');
    await subject?.setValue('Projector fixed');
    await (await dialog.getHarness(WjButtonHarness.with({ label: 'Save' }))).click();
    await fixture.whenStable();

    const toast = await loader.getHarness(WjToastHarness);
    expect(await (await toast.getMessages())[0]?.getSummary()).toBe('Ticket WJ-1031 updated');
    // The edit stamps "updated", so the ticket moves to the top of the newest-first sort.
    expect((await table.getCellTexts())[0]?.slice(0, 2)).toEqual(['WJ-1031', 'Projector fixed']);
    await vi.waitFor(() => {
      expect(document.activeElement?.getAttribute('aria-label')).toBe('Edit ticket WJ-1031');
    });
  });

  it('asks before deleting one ticket, focuses Cancel first, and a Cancel deletes nothing', async () => {
    const { fixture, root, loader, table } = await setup();

    press(ariaButton(root, 'Delete ticket WJ-1032'));
    await fixture.whenStable();
    const confirm = await loader.getHarness(WjConfirmDialogHarness);
    expect(await confirm.getMessage()).toBe('Delete ticket WJ-1032?');
    expect(await confirm.getRejectLabel()).toBe('Cancel');
    await vi.waitFor(() => {
      expect(document.activeElement?.textContent.trim()).toBe('Cancel');
    });
    await confirm.reject();
    await fixture.whenStable();

    expect(await table.getReportText()).toBe('Showing 1 to 10 of 32');
  });

  it('deletes a confirmed ticket, toasts it and moves focus to the table region', async () => {
    const { fixture, root, loader, table } = await setup();

    press(ariaButton(root, 'Delete ticket WJ-1032'));
    await fixture.whenStable();
    await (await loader.getHarness(WjConfirmDialogHarness)).accept();
    await fixture.whenStable();

    const toast = await loader.getHarness(WjToastHarness);
    expect(await (await toast.getMessages())[0]?.getSummary()).toBe('Ticket WJ-1032 deleted');
    expect(await table.getReportText()).toBe('Showing 1 to 10 of 31');
    await vi.waitFor(() => {
      expect(document.activeElement).toBe(root.querySelector('[role="region"]'));
    });
  });

  it('deletes the selection after one confirm, and the deleted ids leave the selection', async () => {
    const { fixture, root, loader, table } = await setup();
    await table.selectRow(0);
    await table.selectRow(1);

    press(labelled(root, 'Delete selected'));
    await fixture.whenStable();
    const confirm = await loader.getHarness(WjConfirmDialogHarness);
    expect(await confirm.getMessage()).toBe('Delete 2 tickets?');
    await confirm.accept();
    await fixture.whenStable();

    const toast = await loader.getHarness(WjToastHarness);
    expect(await (await toast.getMessages())[0]?.getSummary()).toBe('2 tickets deleted');
    expect(await table.getReportText()).toBe('Showing 1 to 10 of 30');
    expect(await table.getSelectedRowIndexes()).toEqual([]);
    const remove = await TestbedHarnessEnvironment.loader(fixture).getHarness(
      WjButtonHarness.with({ label: 'Delete selected' }),
    );
    expect(await remove.isDisabled()).toBe(true);
  });

  it('drops a selected ticket that a search hides', async () => {
    const { fixture, root, table } = await setup();
    await table.selectRow(0);

    search(root, 'WJ-1031');
    await fixture.whenStable();

    expect(await table.getSelectedRowIndexes()).toEqual([]);
    const remove = await TestbedHarnessEnvironment.loader(fixture).getHarness(
      WjButtonHarness.with({ label: 'Delete selected' }),
    );
    expect(await remove.isDisabled()).toBe(true);
  });

  it('pre-fills the search from ?id=', async () => {
    const { root, table } = await setup({ id: 'WJ-1031' });

    expect(searchInput(root).value).toBe('WJ-1031');
    expect((await table.getCellTexts()).map((row) => row[0])).toEqual(['WJ-1031']);
  });

  it('pre-fills the search from ?assignee=', async () => {
    const { table } = await setup({ assignee: 'Sana Aziz' });

    const ids = (await table.getCellTexts()).map((row) => row[0]);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.every((id) => TICKETS.find((t) => t.id === id)?.assignee === 'Sana Aziz')).toBe(
      true,
    );
  });

  describe('Export CSV', () => {
    async function exported(root: HTMLElement, fixture: ComponentFixture<Tickets>) {
      let blob: Blob | undefined;
      vi.spyOn(URL, 'createObjectURL').mockImplementation((source) => {
        blob = source as Blob;
        return 'blob:test';
      });
      vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
      press(labelled(root, 'Export CSV'));
      await fixture.whenStable();
      const bytes = new Uint8Array((await blob?.arrayBuffer()) ?? new ArrayBuffer(0));
      return new TextDecoder().decode(bytes.slice(3)).split('\r\n');
    }

    it('writes a header and every ticket, all pages, in the order the table shows', async () => {
      const { fixture, root, table } = await setup();
      await table.sortBy('Subject');

      const lines = await exported(root, fixture);

      expect(lines[0]).toBe(
        '"Ticket","Subject","Requester","Priority","Status","Assignee","Updated"',
      );
      expect(lines.length).toBe(33);
      const firstTen = (await table.getCellTexts()).map((row) => row[0]);
      expect(lines.slice(1, 11).map((line) => line.split(',')[0]?.replaceAll('"', ''))).toEqual(
        firstTen,
      );
    });

    it('writes only the filtered tickets', async () => {
      const { fixture, root } = await setup();

      search(root, 'WJ-1031');
      await fixture.whenStable();

      expect((await exported(root, fixture)).length).toBe(2);
    });
  });
});
