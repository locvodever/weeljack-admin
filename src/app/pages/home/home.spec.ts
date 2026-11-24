import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { App } from '../../app';
import { routes } from '../../app.routes';

describe('Home page', () => {
  it('renders exactly one h1 with the app name', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();

    const headings = (fixture.nativeElement as HTMLElement).querySelectorAll('h1');
    expect(headings.length).toBe(1);
    expect(headings[0].textContent).toBe('weeljack-admin');
  });

  it('sets the document title from the route', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
    TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');

    expect(TestBed.inject(Title).getTitle()).toBe('Home - weeljack-admin');
  });
});
