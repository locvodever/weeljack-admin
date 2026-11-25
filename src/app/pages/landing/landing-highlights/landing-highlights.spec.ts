import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { LandingHighlights } from './landing-highlights';

describe('LandingHighlights', () => {
  it('has an h2 and two rows, each with an h3, points and a lazy, sized picture', async () => {
    const fixture = TestBed.createComponent(LandingHighlights);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('section')?.id).toBe('highlights');
    expect(root.querySelectorAll('h2').length).toBe(1);
    const rows = Array.from(root.querySelectorAll('.row'));
    expect(rows.length).toBe(2);
    for (const row of rows) {
      expect(row.querySelectorAll('h3').length).toBe(1);
      expect(row.querySelectorAll('li').length).toBeGreaterThanOrEqual(2);
      const img = row.querySelector('img');
      expect(img?.getAttribute('alt')?.trim()).not.toBe('');
      expect(img?.getAttribute('loading')).toBe('lazy');
      expect(img?.hasAttribute('width') && img.hasAttribute('height')).toBe(true);
    }
  });
});
