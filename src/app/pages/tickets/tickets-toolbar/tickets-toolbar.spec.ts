import { TestBed } from '@angular/core/testing';
import { provideWeeljack } from 'weeljack-ng';
import { wjPolice } from 'weeljack-ng/preset-police';
import { describe, expect, it } from 'vitest';
import { TicketsToolbar } from './tickets-toolbar';

async function render(selectedCount: number) {
  TestBed.configureTestingModule({
    providers: [provideWeeljack({ preset: wjPolice, darkMode: 'class' })],
  });
  const fixture = TestBed.createComponent(TicketsToolbar);
  fixture.componentRef.setInput('search', 'abc');
  fixture.componentRef.setInput('selectedCount', selectedCount);
  await fixture.whenStable();
  const events: string[] = [];
  fixture.componentInstance.create.subscribe(() => events.push('create'));
  fixture.componentInstance.removeSelected.subscribe(() => events.push('remove'));
  fixture.componentInstance.exportCsv.subscribe(() => events.push('export'));
  fixture.componentInstance.searchChange.subscribe((text) => events.push(`search:${text}`));
  return { fixture, root: fixture.nativeElement as HTMLElement, events };
}

function buttons(root: HTMLElement): HTMLButtonElement[] {
  return Array.from(root.querySelectorAll('button'));
}

describe('TicketsToolbar', () => {
  it('has New, Delete selected and Export CSV with decorative icons, and a named search', async () => {
    const { root } = await render(0);

    expect(buttons(root).map((button) => button.textContent.trim())).toEqual([
      'New',
      'Delete selected',
      'Export CSV',
    ]);
    for (const icon of Array.from(root.querySelectorAll('button svg'))) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }
    const input = root.querySelector('input');
    expect(input?.getAttribute('aria-label')).toBe('Search tickets');
    expect(input?.value).toBe('abc');
  });

  it('disables Delete selected while nothing is selected', async () => {
    const none = await render(0);
    expect(buttons(none.root)[1]?.disabled).toBe(true);
    TestBed.resetTestingModule();

    const some = await render(2);
    expect(buttons(some.root)[1]?.disabled).toBe(false);
  });

  it('emits each action and the search text', async () => {
    const { fixture, root, events } = await render(1);

    for (const button of buttons(root)) {
      button.click();
    }
    const input = root.querySelector('input');
    if (input === null) {
      throw new Error('no input');
    }
    input.value = 'vpn';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(events).toEqual(['create', 'remove', 'export', 'search:vpn']);
  });
});
