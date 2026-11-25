import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { LandingHero } from './landing-hero';

describe('LandingHero', () => {
  it('has the page h1, the two actions and an eager, sized, described picture', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(LandingHero);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('h1').length).toBe(1);
    const links = Array.from(root.querySelectorAll('a.link-button'));
    expect(links.map((link) => link.textContent.trim())).toEqual(['View the dashboard', 'Login']);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/', '/auth/login']);
    const img = root.querySelector('img');
    expect(img?.getAttribute('alt')?.trim()).not.toBe('');
    expect(img?.getAttribute('width')).toBe('640');
    expect(img?.getAttribute('height')).toBe('400');
    expect(img?.hasAttribute('loading')).toBe(false);
  });
});
