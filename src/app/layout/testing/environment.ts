import type { OutputRef } from '@angular/core';
import { vi } from 'vitest';
import { LAYOUT_STORAGE_KEY } from '../layout.service';

/**
 * Makes `window.matchMedia` answer the two queries the shell asks, so a spec does not depend on the
 * size of the test iframe or the OS scheme. Any other query does not match.
 */
export function stubMatchMedia(options: { wide: boolean; dark?: boolean }): void {
  vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
    const matches =
      query === '(min-width: 960px)'
        ? options.wide
        : query === '(prefers-color-scheme: dark)'
          ? (options.dark ?? false)
          : false;
    return Object.assign(new EventTarget(), {
      matches,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
    });
  });
}

/** Clears what a shell spec leaves behind: the stored choices and the dark class on `<html>`. */
export function resetLayoutEnvironment(): void {
  localStorage.removeItem(LAYOUT_STORAGE_KEY);
  document.documentElement.classList.remove('wj-dark');
}

/** Resolves the next time `output` emits, so a spec waits on the event itself and not on a timer. */
export function next(output: OutputRef<void>): Promise<void> {
  return new Promise((resolve) => {
    const subscription = output.subscribe(() => {
      subscription.unsubscribe();
      resolve();
    });
  });
}
