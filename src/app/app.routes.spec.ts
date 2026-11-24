import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Route, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';
import { appConfig } from './app.config';
import { LAYOUT_STORAGE_KEY } from './layout/layout.service';
import { resetLayoutEnvironment } from './layout/testing/environment';
import { routes } from './app.routes';

interface Leaf {
  readonly url: string;
  readonly title: unknown;
}

/** Every page route (one that shows a component of its own), with its URL and declared title. */
function leaves(list: Route[], prefix: string): Leaf[] {
  return list.flatMap((route) => {
    const path = route.path ?? '';
    if (path.includes('*') || route.redirectTo !== undefined) {
      return [];
    }
    const url = [prefix, path].filter((part) => part !== '').join('/');
    if (route.children !== undefined) {
      return leaves(route.children, url);
    }
    return [{ url: `/${url}`, title: route.title }];
  });
}

describe('routes', () => {
  beforeEach(() => {
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    TestBed.configureTestingModule({ providers: appConfig.providers });
  });

  afterEach(() => {
    resetLayoutEnvironment();
  });

  it('gives every page route its own non-empty title', () => {
    const pages = leaves(routes, '');

    expect(pages.length).toBeGreaterThan(0);
    for (const page of pages) {
      expect(page.title, page.url).toMatch(/^\S.* - weeljack-admin$/);
    }
    expect(new Set(pages.map((page) => page.title)).size).toBe(pages.length);
  });

  it('sets the document title of every page route on navigation', async () => {
    const fixture = TestBed.createComponent(App);
    for (const page of leaves(routes, '')) {
      await TestBed.inject(Router).navigateByUrl(page.url);
      await fixture.whenStable();
      expect(TestBed.inject(Title).getTitle(), page.url).toBe(page.title);
    }
    fixture.destroy();
  });

  it('renders the not-found page in place for an unknown address, keeping the URL and title', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/no/such/page');
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(router.url).toBe('/no/such/page');
    expect(root.querySelector('h1')?.textContent.trim()).toBe('Page not found');
    expect(TestBed.inject(Title).getTitle()).toBe('Page not found - weeljack-admin');
    fixture.destroy();
  });

  it('keeps the shell around /empty and drops it on a full page', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const root = fixture.nativeElement as HTMLElement;

    await router.navigateByUrl('/empty');
    await fixture.whenStable();
    expect(root.querySelector('app-layout')).not.toBeNull();
    expect(root.querySelector('h1')?.textContent.trim()).toBe('Empty page');

    await router.navigateByUrl('/auth/access');
    await fixture.whenStable();
    expect(root.querySelector('app-layout')).toBeNull();
    expect(root.querySelector('app-full-page main')).not.toBeNull();
    expect(root.querySelector('h1')?.textContent.trim()).toBe('Access denied');
    fixture.destroy();
  });

  it('renders the landing page at /landing, not the not-found page, with its own title', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/landing');
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent.trim()).toBe('A calm service desk for busy teams');
    expect(root.querySelector('app-landing')).not.toBeNull();
    expect(TestBed.inject(Title).getTitle()).toBe('Landing - weeljack-admin');
    fixture.destroy();
  });

  it('applies the stored dark scheme on a full page', async () => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ scheme: 'dark' }));
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/auth/error');
    await fixture.whenStable();

    expect(document.documentElement.classList.contains('wj-dark')).toBe(true);
    fixture.destroy();
  });
});
