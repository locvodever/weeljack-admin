import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';
import { appConfig } from '../../../app.config';
import { LandingTopbar } from './landing-topbar';

async function render() {
  TestBed.configureTestingModule({ providers: appConfig.providers });
  const fixture = TestBed.createComponent(LandingTopbar);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  const toggle = root.querySelector<HTMLButtonElement>('button.toggle');
  if (toggle === null) {
    throw new Error('the Menu toggle is missing');
  }
  return { fixture, root, toggle };
}

function link(root: HTMLElement, name: string): HTMLAnchorElement {
  const found = Array.from(root.querySelectorAll('a')).find(
    (item) => item.textContent.trim() === name,
  );
  if (found === undefined) {
    throw new Error(`no link named ${name}`);
  }
  return found;
}

describe('LandingTopbar', () => {
  it('links each section through the router, so the href resolves to /landing#id', async () => {
    const { root } = await render();

    const nav = root.querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBe('Sections');
    const hrefs = Array.from(nav?.querySelectorAll('a') ?? []).map((item) => ({
      name: item.textContent.trim(),
      href: item.getAttribute('href') ?? '',
    }));
    expect(hrefs.map((item) => item.name)).toEqual(['Features', 'Highlights', 'Pricing']);
    expect(hrefs[0].href.endsWith('/landing#features')).toBe(true);
    expect(hrefs[1].href.endsWith('/landing#highlights')).toBe(true);
    expect(hrefs[2].href.endsWith('/landing#pricing')).toBe(true);
    // Never a bare fragment: under <base href> it would point at the dashboard.
    expect(root.querySelector('a[href^="#"]')).toBeNull();
  });

  it('links the wordmark and both actions into the app', async () => {
    const { root } = await render();

    expect(link(root, 'weeljack-admin').getAttribute('href')).toBe('/');
    const login = link(root, 'Login');
    expect(login.getAttribute('href')).toBe('/auth/login');
    expect(login.classList.contains('link-button')).toBe(true);
    expect(login.classList.contains('outlined')).toBe(true);
    const dashboard = link(root, 'View the dashboard');
    expect(dashboard.getAttribute('href')).toBe('/');
    expect(dashboard.classList.contains('link-button')).toBe(true);
  });

  it('has a named Menu toggle that flips aria-expanded and controls the folded list', async () => {
    const { fixture, root, toggle } = await render();

    expect(toggle.textContent.trim()).toBe('Menu');
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(root.querySelector(`#${toggle.getAttribute('aria-controls') ?? 'none'}`)).not.toBeNull();

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on Escape and returns focus to the toggle', async () => {
    const { fixture, root, toggle } = await render();
    const focus = vi.spyOn(toggle, 'focus');

    toggle.click();
    await fixture.whenStable();
    link(root, 'Features').dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await fixture.whenStable();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(focus).toHaveBeenCalledOnce();
  });

  it('closes when a section link is chosen', async () => {
    const { fixture, root, toggle } = await render();

    toggle.click();
    await fixture.whenStable();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    link(root, 'Pricing').click();
    await fixture.whenStable();

    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
