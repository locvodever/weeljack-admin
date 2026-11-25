import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { ErrorState } from './error-state';

describe('ErrorState', () => {
  it('shows the named illustration, the heading and the text', async () => {
    const fixture = TestBed.createComponent(ErrorState);
    fixture.componentRef.setInput('art', 'art/error.svg');
    fixture.componentRef.setInput('alt', 'A monitor with a warning sign');
    fixture.componentRef.setInput('heading', 'Something went wrong');
    fixture.componentRef.setInput('text', 'Try again.');
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    const img = root.querySelector('img');
    expect(img?.getAttribute('src')).toBe('art/error.svg');
    expect(img?.getAttribute('alt')).toBe('A monitor with a warning sign');
    expect(root.querySelector('h1')?.textContent.trim()).toBe('Something went wrong');
    expect(root.querySelector('.text')?.textContent.trim()).toBe('Try again.');
  });
});
