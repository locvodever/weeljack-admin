import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { Empty } from './empty';

describe('Empty', () => {
  it('has the "Empty page" heading and one line of text', async () => {
    const fixture = TestBed.createComponent(Empty);
    await fixture.whenStable();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('h1').length).toBe(1);
    expect(root.querySelector('h1')?.textContent.trim()).toBe('Empty page');
    expect(root.querySelector('p')?.textContent.trim()).toBe('Start a new screen from here.');
  });
});
