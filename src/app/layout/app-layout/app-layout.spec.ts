import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../app';
import { appConfig } from '../../app.config';
import { LayoutService } from '../layout.service';
import { resetLayoutEnvironment, stubMatchMedia } from '../testing/environment';

describe('AppLayout', () => {
  beforeEach(() => {
    resetLayoutEnvironment();
    TestBed.configureTestingModule({ providers: appConfig.providers });
  });

  afterEach(() => {
    resetLayoutEnvironment();
  });

  async function render(wide: boolean) {
    stubMatchMedia({ wide });
    const fixture = TestBed.createComponent(App);
    document.body.append(fixture.nativeElement as HTMLElement);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    return { fixture, root, layout: TestBed.inject(LayoutService) };
  }

  it('puts the skip link first, and it moves focus to main', async () => {
    const { fixture, root } = await render(true);

    const first = root.querySelector('a, button');
    expect(first?.textContent.trim()).toBe('Skip to content');
    expect(first?.getAttribute('href')).toBe('#main');
    (first as HTMLAnchorElement).click();

    expect(document.activeElement?.id).toBe('main');
    expect(document.activeElement?.getAttribute('tabindex')).toBe('-1');
    fixture.destroy();
  });

  it('has the banner, Main navigation, main and footer landmarks, in document order', async () => {
    const { fixture, root } = await render(true);

    const order = Array.from(
      root.querySelectorAll('header, nav[aria-label="Main"], main, footer'),
    ).map((node) => node.tagName.toLowerCase());
    expect(order).toEqual(['header', 'nav', 'main', 'footer']);
    expect(root.querySelectorAll('main#main').length).toBe(1);
    fixture.destroy();
  });

  it('leaves the only h1 to the page', async () => {
    const { fixture, root } = await render(true);

    expect(root.querySelectorAll('h1').length).toBe(1);
    expect(root.querySelector('main h1')).not.toBeNull();
    fixture.destroy();
  });

  it('docks the sidebar in Static mode, and the menu toggle collapses it', async () => {
    const { fixture, root, layout } = await render(true);

    expect(root.querySelector('app-sidebar#docked-nav')).not.toBeNull();
    layout.toggleMenu();
    await fixture.whenStable();
    expect(root.querySelector('app-sidebar#docked-nav')).toBeNull();
    expect(layout.drawerOpen()).toBe(false);
    fixture.destroy();
  });

  it('has no docked sidebar in Overlay mode, and loads the drawer on the first open', async () => {
    const { fixture, root, layout } = await render(true);
    layout.setMenuMode('overlay');
    await fixture.whenStable();

    expect(root.querySelector('app-sidebar#docked-nav')).toBeNull();
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    layout.toggleMenu();
    await fixture.whenStable();
    expect(document.querySelector('[role="dialog"] nav[aria-label="Main"]')).not.toBeNull();
    fixture.destroy();
  });
});
