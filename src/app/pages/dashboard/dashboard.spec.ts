import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../app';
import { appConfig } from '../../app.config';
import { resetLayoutEnvironment } from '../../layout/testing/environment';

describe('Dashboard page', () => {
  beforeEach(() => {
    resetLayoutEnvironment();
    TestBed.configureTestingModule({ providers: appConfig.providers });
  });

  afterEach(() => {
    resetLayoutEnvironment();
  });

  it('renders one h1, the five widgets and the route title at /', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;

    const h1 = root.querySelectorAll('h1');
    expect(h1.length).toBe(1);
    expect(h1[0]?.textContent.trim()).toBe('Dashboard');
    expect(TestBed.inject(Title).getTitle()).toBe('Dashboard - weeljack-admin');
    const h2 = Array.from(root.querySelectorAll('wjt-dashboard h2')).map((h) =>
      h.textContent.trim(),
    );
    expect(h2).toEqual([
      'Today at a glance',
      'Recent tickets',
      'Tickets by status',
      'Agent workload',
      'Activity',
    ]);
    fixture.destroy();
  });
});
