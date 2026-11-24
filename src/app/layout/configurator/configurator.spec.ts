import { TestBed } from '@angular/core/testing';
import { provideWeeljack } from 'weeljack-ng';
import { wjPolice } from 'weeljack-ng/preset-police';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import { LayoutService } from '../layout.service';
import { next, resetLayoutEnvironment, stubMatchMedia } from '../testing/environment';
import { Configurator } from './configurator';

describe('Configurator', () => {
  beforeEach(() => {
    resetLayoutEnvironment();
    stubMatchMedia({ wide: true });
    TestBed.configureTestingModule({
      providers: [provideWeeljack({ preset: wjPolice, darkMode: 'class' })],
    });
  });

  afterEach(() => {
    resetLayoutEnvironment();
  });

  async function open() {
    const fixture = TestBed.createComponent(Configurator);
    const anchor = document.createElement('button');
    anchor.textContent = 'Theme settings';
    document.body.append(anchor, fixture.nativeElement as HTMLElement);
    const layout = TestBed.inject(LayoutService);
    await fixture.whenStable();
    anchor.focus();
    const opened = next(fixture.componentInstance.opened);
    fixture.componentInstance.toggle(new MouseEvent('click'), anchor);
    await opened;
    const panel = document.querySelector<HTMLElement>('.panel');
    return { fixture, layout, anchor, panel };
  }

  function legends(panel: HTMLElement | null): string[] {
    return Array.from(panel?.querySelectorAll('.legend') ?? []).map((node) =>
      node.textContent.trim(),
    );
  }

  it('is named by its "Theme" heading and lists Preset, Surface, Scheme, Menu in that order', async () => {
    const { fixture, panel } = await open();

    const dialog = document.querySelector('[role="dialog"]');
    expect(
      document.getElementById(dialog?.getAttribute('aria-labelledby') ?? '')?.textContent,
    ).toBe('Theme');
    expect(legends(panel)).toEqual(['Preset', 'Surface', 'Scheme', 'Menu']);
    fixture.destroy();
  });

  it('offers every preset with Police first, and the five named surfaces by name', async () => {
    const { fixture, panel } = await open();

    const names = (group: string) =>
      Array.from(panel?.querySelectorAll(`input[name="${group}"] + .option-text`) ?? []).map(
        (node) => node.textContent.trim(),
      );
    expect(names('configurator-preset')).toEqual([
      'Police',
      'Aura',
      'Lara',
      'Material',
      'Noir',
      'Nora',
    ]);
    expect(names('configurator-surface')).toEqual(['Zinc', 'Slate', 'Gray', 'Neutral', 'Stone']);
    fixture.destroy();
  });

  it('focuses the checked preset when it opens', async () => {
    const { fixture } = await open();

    const active = document.activeElement as HTMLInputElement;
    expect(active.type).toBe('radio');
    expect(active.value).toBe('police');
    expect(active.checked).toBe(true);
    fixture.destroy();
  });

  it('applies a choice through the layout service at once', async () => {
    const { fixture, layout, panel } = await open();
    const preset = vi.spyOn(layout, 'setPreset').mockResolvedValue();
    const surface = vi.spyOn(layout, 'setSurface').mockResolvedValue();

    panel?.querySelector<HTMLInputElement>('input[value="aura"]')?.click();
    panel?.querySelector<HTMLInputElement>('input[value="stone"]')?.click();

    expect(preset).toHaveBeenCalledWith('aura');
    expect(surface).toHaveBeenCalledWith('stone');
    fixture.destroy();
  });

  it('switches scheme and menu mode from the select buttons', async () => {
    const { fixture, layout, panel } = await open();

    const press = (label: string) =>
      Array.from(panel?.querySelectorAll<HTMLElement>('[aria-pressed]') ?? [])
        .find((node) => node.textContent.trim() === label)
        ?.click();
    press('Dark');
    press('Overlay');

    expect(layout.scheme()).toBe('dark');
    expect(layout.menuMode()).toBe('overlay');
    fixture.destroy();
  });

  it('closes on Escape and returns focus to its trigger', async () => {
    const { fixture, anchor } = await open();

    const closed = next(fixture.componentInstance.closed);
    await userEvent.keyboard('{Escape}');
    await closed;

    expect(document.activeElement).toBe(anchor);
    fixture.destroy();
  });
});
