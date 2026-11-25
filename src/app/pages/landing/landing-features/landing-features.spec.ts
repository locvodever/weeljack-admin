import { TestBed } from '@angular/core/testing';
import { provideWeeljack } from 'weeljack-ng';
import { wjPolice } from 'weeljack-ng/preset-police';
import { describe, expect, it } from 'vitest';
import { LandingFeatures } from './landing-features';

describe('LandingFeatures', () => {
  it('has an h2 and six cards, each with a decorative icon and an h3', async () => {
    TestBed.configureTestingModule({
      providers: [provideWeeljack({ preset: wjPolice, darkMode: 'class' })],
    });
    const fixture = TestBed.createComponent(LandingFeatures);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('h2').length).toBe(1);
    const cards = Array.from(root.querySelectorAll('wj-card'));
    expect(cards.length).toBe(6);
    for (const card of cards) {
      expect(card.querySelectorAll('h3').length).toBe(1);
      expect(card.querySelector('h3')?.textContent.trim()).not.toBe('');
      expect(card.querySelector('.tile')?.getAttribute('aria-hidden')).toBe('true');
    }
    expect(root.querySelector('section')?.id).toBe('features');
  });
});
