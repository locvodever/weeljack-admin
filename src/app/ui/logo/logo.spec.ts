import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Logo } from './logo';

describe('Logo', () => {
  it('draws a decorative, unfocusable SVG with no ids, 28 px by default', async () => {
    const fixture = TestBed.createComponent(Logo);
    await fixture.whenStable();

    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('focusable')).toBe('false');
    expect(svg?.getAttribute('width')).toBe('28');
    expect(svg?.getAttribute('height')).toBe('28');
    expect(svg?.querySelector('[id]')).toBeNull();
    expect(svg?.textContent.trim()).toBe('');
  });

  it('takes its size from the size input', async () => {
    const fixture = TestBed.createComponent(Logo);
    fixture.componentRef.setInput('size', 40);
    await fixture.whenStable();

    const svg = (fixture.nativeElement as HTMLElement).querySelector('svg');
    expect(svg?.getAttribute('width')).toBe('40');
    expect(svg?.getAttribute('height')).toBe('40');
  });

  it('paints the shield and the glyph from the preset colours', async () => {
    const fixture = TestBed.createComponent(Logo);
    const host = fixture.nativeElement as HTMLElement;
    host.style.setProperty('--wj-primary-color', 'rgb(30, 58, 138)');
    host.style.setProperty('--wj-primary-active-color', 'rgb(29, 78, 216)');
    host.style.setProperty('--wj-primary-contrast-color', 'rgb(255, 255, 255)');
    document.body.append(host);
    await fixture.whenStable();

    const style = (selector: string): CSSStyleDeclaration => {
      const element = host.querySelector(selector);
      if (!element) throw new Error(`no ${selector}`);
      return getComputedStyle(element);
    };
    expect(style('.left').fill).toBe('rgb(30, 58, 138)');
    expect(style('.right').fill).toBe('rgb(29, 78, 216)');
    expect(style('.dot').fill).toBe('rgb(255, 255, 255)');
    expect(style('.glyph').stroke).toBe('rgb(255, 255, 255)');
    host.remove();
  });
});
