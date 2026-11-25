import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideWeeljack } from 'weeljack-ng';
import { wjPolice } from 'weeljack-ng/preset-police';
import { describe, expect, it } from 'vitest';
import { LandingPricing } from './landing-pricing';

async function render() {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), provideWeeljack({ preset: wjPolice, darkMode: 'class' })],
  });
  const fixture = TestBed.createComponent(LandingPricing);
  await fixture.whenStable();
  return fixture.nativeElement as HTMLElement;
}

describe('LandingPricing', () => {
  it('has three tiers, each with an h3, a price, a list of features and one action link', async () => {
    const root = await render();

    expect(root.querySelector('section')?.id).toBe('pricing');
    const cards = Array.from(root.querySelectorAll('wj-card'));
    expect(cards.length).toBe(3);
    expect(
      cards.map((card) => card.querySelector('h3')?.textContent.replace(/\s+/g, ' ').trim()),
    ).toEqual(['Starter', 'Recommended Team', 'Enterprise']);
    for (const card of cards) {
      expect(card.querySelectorAll('ul li').length).toBe(3);
      expect(card.querySelector('.amount')?.textContent.trim()).not.toBe('');
      expect(card.querySelectorAll('a.link-button').length).toBe(1);
    }
  });

  it('marks exactly one tier as recommended, in text, with a 2 px border', async () => {
    const root = await render();

    const badges = Array.from(root.querySelectorAll('.badge'));
    expect(badges.map((badge) => badge.textContent.trim())).toEqual(['Recommended']);
    const cards = Array.from(root.querySelectorAll('wj-card'));
    const borders = cards.map((card) => {
      const surface = card.firstElementChild;
      return surface === null ? '' : getComputedStyle(surface).borderTopWidth;
    });
    expect(borders).toEqual([borders[0], '2px', borders[0]]);
    expect(borders[0]).not.toBe('2px');
  });

  it('links the actions into the app and never to a payment', async () => {
    const root = await render();

    const links = Array.from(root.querySelectorAll('a.link-button'));
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/',
      '/auth/login',
      '/auth/login',
    ]);
    expect(links.map((link) => link.classList.contains('outlined'))).toEqual([true, false, true]);
  });
});
