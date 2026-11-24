import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideWeeljack } from 'weeljack-ng';
import { WjButtonHarness } from 'weeljack-ng/button/testing';
import { WjDialogHarness } from 'weeljack-ng/dialog/testing';
import { WjFieldHarness } from 'weeljack-ng/field/testing';
import { WjInputTextHarness } from 'weeljack-ng/inputtext/testing';
import { wjPolice } from 'weeljack-ng/preset-police';
import { WjRadioButtonHarness } from 'weeljack-ng/radiobutton/testing';
import { WjSelectHarness } from 'weeljack-ng/select/testing';
import { describe, expect, it } from 'vitest';
import type { Ticket, TicketDraft } from '../../../data/models';
import { TicketDialog } from './ticket-dialog';

const TICKET: Ticket = {
  id: 'WJ-7',
  subject: 'Badge reader offline',
  description: 'Since nine.',
  requester: 'Ada Example',
  priority: 'high',
  status: 'waiting',
  assignee: 'Priya Nair',
  created: '2026-11-20T08:00:00.000Z',
  updated: '2026-11-21T08:00:00.000Z',
};

async function open(ticket: Ticket | null) {
  TestBed.configureTestingModule({
    providers: [provideWeeljack({ preset: wjPolice, darkMode: 'class' })],
  });
  const fixture = TestBed.createComponent(TicketDialog);
  fixture.componentRef.setInput('ticket', ticket);
  const saved: TicketDraft[] = [];
  fixture.componentInstance.save.subscribe((draft) => saved.push(draft));
  fixture.componentRef.setInput('visible', true);
  await fixture.whenStable();
  const loader = TestbedHarnessEnvironment.documentRootLoader(fixture);
  const dialog = await loader.getHarness(WjDialogHarness);
  return { fixture, dialog, saved };
}

describe('TicketDialog', () => {
  it('is a modal "New ticket" with blank fields and the default choices', async () => {
    const { dialog } = await open(null);

    expect(await dialog.getTitle()).toBe('New ticket');
    expect(await dialog.isModal()).toBe(true);
    const [subject, requester] = await dialog.getAllHarnesses(WjInputTextHarness);
    expect(await subject?.getValue()).toBe('');
    expect(await requester?.getValue()).toBe('');
    const selects = await dialog.getAllHarnesses(WjSelectHarness);
    expect(await Promise.all(selects.map((select) => select.getValueText()))).toEqual([
      'Open',
      'Mara Okafor',
    ]);
    const radio = await dialog.getHarness(WjRadioButtonHarness.with({ checked: true }));
    expect(await radio.getLabelText()).toBe('Normal');
  });

  it('fills every field from the ticket it edits', async () => {
    const { dialog } = await open(TICKET);

    expect(await dialog.getTitle()).toBe('Edit ticket WJ-7');
    const [subject, requester] = await dialog.getAllHarnesses(WjInputTextHarness);
    expect(await subject?.getValue()).toBe('Badge reader offline');
    expect(await requester?.getValue()).toBe('Ada Example');
    const selects = await dialog.getAllHarnesses(WjSelectHarness);
    expect(await Promise.all(selects.map((select) => select.getValueText()))).toEqual([
      'Waiting',
      'Priya Nair',
    ]);
    const radio = await dialog.getHarness(WjRadioButtonHarness.with({ checked: true }));
    expect(await radio.getLabelText()).toBe('High');
  });

  it('emits the trimmed draft on a valid Save and closes', async () => {
    const { fixture, dialog, saved } = await open(null);
    const [subject, requester] = await dialog.getAllHarnesses(WjInputTextHarness);
    await subject?.setValue('  Mouse stuck  ');
    await requester?.setValue('  Ada Example  ');
    await (await dialog.getHarness(WjRadioButtonHarness.with({ label: 'Urgent' }))).check();

    await (await dialog.getHarness(WjButtonHarness.with({ label: 'Save' }))).click();
    await fixture.whenStable();

    expect(saved).toEqual([
      {
        subject: 'Mouse stuck',
        description: '',
        requester: 'Ada Example',
        priority: 'urgent',
        status: 'open',
        assignee: 'Mara Okafor',
      },
    ]);
    expect(fixture.componentInstance.visible()).toBe(false);
  });

  it('refuses a blank subject and emits nothing', async () => {
    const { fixture, dialog, saved } = await open(null);
    const [subject, requester] = await dialog.getAllHarnesses(WjInputTextHarness);
    await subject?.setValue('   ');
    await requester?.setValue('Ada Example');

    await (await dialog.getHarness(WjButtonHarness.with({ label: 'Save' }))).click();
    await fixture.whenStable();

    expect(saved).toEqual([]);
    expect(fixture.componentInstance.visible()).toBe(true);
  });

  it('refuses a blank requester: says so, marks it invalid and focuses it', async () => {
    const { fixture, dialog, saved } = await open(null);
    const [subject, requester] = await dialog.getAllHarnesses(WjInputTextHarness);
    await subject?.setValue('Mouse stuck');
    await requester?.setValue('   ');

    await (await dialog.getHarness(WjButtonHarness.with({ label: 'Save' }))).click();
    await fixture.whenStable();

    expect(saved).toEqual([]);
    expect(fixture.componentInstance.visible()).toBe(true);
    const field = await dialog.getHarness(WjFieldHarness.with({ label: 'Requester' }));
    expect(await field.getError()).toBe('Enter a requester');
    expect(await requester?.isInvalid()).toBe(true);
    expect(await requester?.isFocused()).toBe(true);
    expect(await subject?.isInvalid()).toBe(false);
  });

  it('focuses the subject first when both required fields are blank', async () => {
    const { fixture, dialog } = await open(null);
    const [subject, requester] = await dialog.getAllHarnesses(WjInputTextHarness);

    await (await dialog.getHarness(WjButtonHarness.with({ label: 'Save' }))).click();
    await fixture.whenStable();

    expect(await subject?.isInvalid()).toBe(true);
    expect(await requester?.isInvalid()).toBe(true);
    expect(await subject?.isFocused()).toBe(true);
    const errors = await Promise.all(
      (await dialog.getAllHarnesses(WjFieldHarness)).map((field) => field.getError()),
    );
    expect(errors.filter((error) => error !== null && error !== '')).toEqual([
      'Enter a subject',
      'Enter a requester',
    ]);
  });

  it('closes on Escape without saving', async () => {
    const { fixture, dialog, saved } = await open(TICKET);

    await dialog.closeWithEscape();
    await fixture.whenStable();

    expect(saved).toEqual([]);
    expect(fixture.componentInstance.visible()).toBe(false);
  });
});
