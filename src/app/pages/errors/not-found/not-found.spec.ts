import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { NotFound } from './not-found';

describe('NotFound', () => {
  it('hides the numeral, names the page and links to the dashboard and tickets', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(NotFound);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('h1').length).toBe(1);
    expect(root.querySelector('h1')?.textContent.trim()).toBe('Page not found');
    expect(root.querySelector('.numeral')?.getAttribute('aria-hidden')).toBe('true');
    const links = Array.from(root.querySelectorAll('a'));
    expect(links.map((link) => link.textContent.trim())).toEqual([
      'Go to dashboard',
      'Open tickets',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual(['/', '/tickets']);
  });
});
