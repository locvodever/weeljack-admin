import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { App } from '../../app';
import { appConfig } from '../../app.config';
import { LAYOUT_STORAGE_KEY } from '../layout.service';
import { resetLayoutEnvironment } from '../testing/environment';

describe('FullPage', () => {
  beforeEach(() => {
    resetLayoutEnvironment();
    TestBed.configureTestingModule({ providers: appConfig.providers });
  });

  afterEach(() => {
    resetLayoutEnvironment();
  });

  it('holds one main landmark and no shell chrome', async () => {
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/notfound');
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('main').length).toBe(1);
    expect(root.querySelector('header, app-sidebar, app-topbar, footer')).toBeNull();
    fixture.destroy();
  });

  it('restores the stored dark scheme on <html>, as the shell does', async () => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify({ scheme: 'dark' }));
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/auth/login');
    await fixture.whenStable();

    expect(document.documentElement.classList.contains('wj-dark')).toBe(true);
    fixture.destroy();
  });
});
