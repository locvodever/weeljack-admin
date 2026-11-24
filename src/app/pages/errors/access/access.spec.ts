import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { Access } from './access';

describe('Access', () => {
  it('has the heading, a named illustration and a link to the dashboard', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(Access);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent.trim()).toBe('Access denied');
    const img = root.querySelector('img');
    expect(img?.getAttribute('src')).toBe('art/access-denied.svg');
    expect(img?.getAttribute('alt')?.trim()).not.toBe('');
    const link = root.querySelector('a');
    expect(link?.textContent.trim()).toBe('Go to dashboard');
    expect(link?.getAttribute('href')).toBe('/');
  });
});
