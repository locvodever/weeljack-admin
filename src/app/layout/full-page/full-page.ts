import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '../layout.service';

/**
 * The frame of the full pages (login, error, access denied, not found): no sidebar, no top bar, one
 * `main` landmark centring the routed panel. It sits beside the shell route, so it injects
 * `LayoutService` itself: the service restores the stored scheme, preset and surface in its own
 * `afterNextRender`, which makes a full page open in the same look as the shell.
 */
@Component({
  selector: 'app-full-page',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './full-page.html',
  styleUrl: './full-page.css',
})
export class FullPage {
  constructor() {
    // Injected for its restore side effect; nothing here reads it.
    inject(LayoutService);
  }
}
