import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { LandingFooter } from './landing-footer';

describe('LandingFooter', () => {
  it('has a Footer nav of headed link columns, the library line and the MIT notice', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(LandingFooter);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Footer');
    const heads = Array.from(root.querySelectorAll('nav h2'));
    expect(heads.map((head) => head.textContent.trim())).toEqual([
      'Product',
      'Template',
      'Project',
    ]);
    const product = Array.from(root.querySelectorAll('nav .column:first-child a'));
    expect(product.map((link) => link.getAttribute('href'))).toEqual([
      '/landing#features',
      '/landing#highlights',
      '/landing#pricing',
    ]);
    const text = root.textContent;
    expect(text).toContain('Built with WeeljackNg');
    expect(text).toContain('MIT licence');
    expect(text).toContain('Loc Vo');
    expect(root.querySelector('a[target]')).toBeNull();
  });
});
