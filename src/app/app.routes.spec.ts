import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Route, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from './app';
import { appConfig } from './app.config';
import { LAYOUT_STORAGE_KEY } from './layout/layout.service';
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
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
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
});
