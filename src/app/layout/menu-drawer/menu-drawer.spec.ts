import { Component, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideWeeljack } from 'weeljack-ng';
import { wjPolice } from 'weeljack-ng/preset-police';
import { WjDrawer } from 'weeljack-ng/drawer';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { LayoutService } from '../layout.service';
import { next, resetLayoutEnvironment, stubMatchMedia } from '../testing/environment';
import { MenuDrawer } from './menu-drawer';

@Component({
  imports: [MenuDrawer],
  template: `
    <button type="button" id="toggle" (click)="layout.openDrawer()">Menu</button>
    <wjt-menu-drawer />
  `,
})
class Host {
  protected readonly layout = inject(LayoutService);
}

@Component({ template: '' })
class Blank {}

describe('MenuDrawer', () => {
  beforeEach(() => {
    resetLayoutEnvironment();
    stubMatchMedia({ wide: false });
    TestBed.configureTestingModule({
      providers: [
        provideWeeljack({ preset: wjPolice, darkMode: 'class' }),
        provideRouter([{ path: '**', component: Blank }]),
      ],
    });
  });

  afterEach(() => {
    resetLayoutEnvironment();
  });

  async function open() {
    const fixture = TestBed.createComponent(Host);
    document.body.append(fixture.nativeElement as HTMLElement);
    const layout = TestBed.inject(LayoutService);
    await fixture.whenStable();
    const toggle = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '#toggle',
    );
    toggle?.focus();
    const drawer = fixture.debugElement.query((node) => node.componentInstance instanceof WjDrawer)
      .componentInstance as WjDrawer;
    const opened = next(drawer.opened);
    toggle?.click();
    await opened;
    return { fixture, layout, toggle, drawer };
  }

  it('is named "Menu" and moves focus inside when it opens', async () => {
    const { fixture } = await open();

    const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(
      document.getElementById(dialog?.getAttribute('aria-labelledby') ?? '')?.textContent,
    ).toContain('Menu');
    expect(dialog?.contains(document.activeElement)).toBe(true);
    expect(dialog?.querySelector('nav')?.getAttribute('aria-label')).toBe('Main');
    fixture.destroy();
  });

  it('closes on Escape and returns focus to the menu toggle', async () => {
    const { fixture, layout, toggle, drawer } = await open();

    const closed = next(drawer.closed);
    await userEvent.keyboard('{Escape}');
    await closed;

    expect(layout.drawerOpen()).toBe(false);
    expect(document.activeElement).toBe(toggle);
    fixture.destroy();
  });

  it('closes when a link is clicked', async () => {
    const { fixture, layout, drawer } = await open();

    const closed = next(drawer.closed);
    document.querySelector<HTMLAnchorElement>('[role="dialog"] a')?.click();
    await closed;

    expect(layout.drawerOpen()).toBe(false);
    fixture.destroy();
  });
});
