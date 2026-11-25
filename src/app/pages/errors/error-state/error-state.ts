import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The panel shared by the error and access-denied pages: an illustration loaded as a file (never
 * inlined, to keep the initial bundle small), the page's one `h1`, one muted line, and the
 * projected actions.
 */
@Component({
  selector: 'app-error-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error-state.html',
  styleUrl: './error-state.css',
})
export class ErrorState {
  /** Path of the illustration, relative to the base href: `art/error.svg`. */
  readonly art = input.required<string>();
  /** What the illustration shows, for assistive technology. */
  readonly alt = input.required<string>();
  readonly heading = input.required<string>();
  readonly text = input.required<string>();
}
