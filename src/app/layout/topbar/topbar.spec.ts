import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideWeeljack } from 'weeljack-ng';
import { wjPolice } from 'weeljack-ng/preset-police';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { LayoutService } from '../layout.service';
import { resetLayoutEnvironment, stubMatchMedia } from '../testing/environment';
import { Topbar } from './topbar';

@Component({ template: '' })
class Blank {}

describe('Topbar', () => {
  beforeEach(() => {
    resetLayoutEnvironment();
    stubMatchMedia({ wide: true });
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

  async function render() {
    const fixture = TestBed.createComponent(Topbar);
    const layout = TestBed.inject(LayoutService);
    await layout.restore();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const button = (label: string) =>
      root.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
    return { fixture, layout, root, button };
  }

  it('gives every icon button an accessible name and hides its icon', async () => {
    const { root } = await render();

    const buttons = Array.from(root.querySelectorAll('button'));
    expect(buttons.map((node) => node.getAttribute('aria-label'))).toEqual([
      'Menu',
      'Dark mode',
      'Theme settings',
      'More actions',
    ]);
    for (const icon of Array.from(root.querySelectorAll('svg'))) {
      expect(icon.getAttribute('aria-hidden')).toBe('true');
    }
    const palette = root.querySelector('svg.palette');
    expect(palette?.getAttribute('focusable')).toBe('false');
  });

  it('puts the wordmark, a link to the home route, after the menu toggle', async () => {
    const { root } = await render();

    const wordmark = root.querySelector('a.wordmark');
    expect(wordmark?.textContent.trim()).toBe('weeljack-admin');
    expect(wordmark?.getAttribute('href')).toBe('/');
    const start = root.querySelector('.start')?.children;
    expect(start?.[0]?.tagName).toBe('WJ-BUTTON');
    expect(start?.[1]).toBe(wordmark);
  });

  it('reports the menu toggle state with aria-expanded and aria-controls', async () => {
    const { fixture, layout, button } = await render();

    expect(button('Menu')?.getAttribute('aria-expanded')).toBe('true');
    expect(button('Menu')?.getAttribute('aria-controls')).toBe('docked-nav');

    button('Menu')?.click();
    await fixture.whenStable();
    expect(layout.sidebarCollapsed()).toBe(true);
    expect(button('Menu')?.getAttribute('aria-expanded')).toBe('false');

    layout.setMenuMode('overlay');
    await fixture.whenStable();
    expect(button('Menu')?.getAttribute('aria-controls')).toBe('drawer-nav');
    expect(button('Menu')?.getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('reports dark mode with aria-pressed and toggles it', async () => {
    const { fixture, layout, button } = await render();

    expect(button('Dark mode')?.getAttribute('aria-pressed')).toBe('false');
    button('Dark mode')?.click();
    await fixture.whenStable();

    expect(layout.scheme()).toBe('dark');
    expect(button('Dark mode')?.getAttribute('aria-pressed')).toBe('true');
    expect(document.documentElement.classList.contains('wj-dark')).toBe(true);
  });

  it('exposes the overflow menu as a popup menu that starts collapsed', async () => {
    const { button } = await render();

    expect(button('More actions')?.getAttribute('aria-haspopup')).toBe('menu');
    expect(button('More actions')?.getAttribute('aria-expanded')).toBe('false');
  });
});
