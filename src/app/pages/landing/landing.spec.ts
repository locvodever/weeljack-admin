import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from '../../app';
import { appConfig } from '../../app.config';
import { LAYOUT_STORAGE_KEY } from '../../layout/layout.service';
import { resetLayoutEnvironment } from '../../layout/testing/environment';

const SECTIONS = ['features', 'highlights', 'pricing'];

describe('Landing', () => {
  beforeEach(() => {
    resetLayoutEnvironment();
    TestBed.configureTestingModule({ providers: appConfig.providers });
  });

  afterEach(() => {
    resetLayoutEnvironment();
  });

  async function open(url: string) {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl(url);
    await fixture.whenStable();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  }

  it('has exactly one h1, one header, one main and one footer, outside the shell', async () => {
    const { fixture, root } = await open('/landing');

    expect(root.querySelectorAll('h1').length).toBe(1);
    expect(root.querySelectorAll('header').length).toBe(1);
    expect(root.querySelectorAll('main').length).toBe(1);
    expect(root.querySelectorAll('footer').length).toBe(1);
    expect(root.querySelector('main header, main footer')).toBeNull();
    expect(root.querySelector('wjt-layout, wjt-full-page')).toBeNull();
    fixture.destroy();
  });

  it('restores the stored dark scheme on <html>, as the shell does', async () => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ scheme: 'dark' }));
    const { fixture } = await open('/landing');

    expect(document.documentElement.classList.contains('wj-dark')).toBe(true);
    fixture.destroy();
  });

  it('names each section by its h2 and makes it a focus target', async () => {
    const { fixture, root } = await open('/landing');

    for (const id of SECTIONS) {
      const section = root.querySelector<HTMLElement>(`#${id}`);
      expect(section?.tagName, id).toBe('SECTION');
      expect(section?.getAttribute('tabindex'), id).toBe('-1');
      const heading = root.querySelector(`#${section?.getAttribute('aria-labelledby') ?? 'none'}`);
      expect(heading?.tagName, id).toBe('H2');
    }
    fixture.destroy();
  });

  it('moves focus to the section after navigating to /landing#pricing', async () => {
    const { fixture } = await open('/landing#pricing');

    await vi.waitFor(() => expect(document.activeElement?.id).toBe('pricing'));
    fixture.destroy();
  });

  it('focuses the section again on a second click of the same link', async () => {
    const { fixture, root } = await open('/landing#pricing');
    await vi.waitFor(() => expect(document.activeElement?.id).toBe('pricing'));

    const link = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('nav[aria-label="Sections"] a'),
    ).find((item) => item.textContent.trim() === 'Pricing');
    root.querySelector<HTMLElement>('#features')?.focus();
    expect(document.activeElement?.id).toBe('features');
    link?.click();

    expect(document.activeElement?.id).toBe('pricing');
    fixture.destroy();
  });

  it('focuses the section of a link to a different fragment', async () => {
    const { fixture, root } = await open('/landing#pricing');
    await vi.waitFor(() => expect(document.activeElement?.id).toBe('pricing'));

    const link = Array.from(
      root.querySelectorAll<HTMLAnchorElement>('nav[aria-label="Sections"] a'),
    ).find((item) => item.textContent.trim() === 'Features');
    link?.click();

    await vi.waitFor(() => expect(document.activeElement?.id).toBe('features'));
    fixture.destroy();
  });

  it('gives every image alt text, a size, and lazy loading below the fold', async () => {
    const { fixture, root } = await open('/landing');

    const images = Array.from(root.querySelectorAll('img'));
    expect(images.length).toBe(3);
    for (const image of images) {
      expect(image.getAttribute('alt')?.trim(), image.src).not.toBe('');
      expect(image.hasAttribute('width') && image.hasAttribute('height'), image.src).toBe(true);
      expect(image.getAttribute('src'), image.src).toMatch(/^art\/landing-[a-z]+\.svg$/);
    }
    const [hero, ...below] = images;
    expect(hero.hasAttribute('loading')).toBe(false);
    expect(below.map((image) => image.getAttribute('loading'))).toEqual(['lazy', 'lazy']);
    fixture.destroy();
  });

  it('has no animation and no smooth scrolling', async () => {
    const { fixture, root } = await open('/landing');

    expect(getComputedStyle(document.documentElement).scrollBehavior).toBe('auto');
    const animated = Array.from(root.querySelectorAll('*')).filter(
      (element) => getComputedStyle(element).animationName !== 'none',
    );
    expect(animated).toEqual([]);
    fixture.destroy();
  });
});
