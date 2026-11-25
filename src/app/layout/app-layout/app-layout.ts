import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutService } from '../layout.service';
import { MenuDrawer } from '../menu-drawer/menu-drawer';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

/**
 * The shell route: skip link, header, the docked sidebar (Static mode, from 960 px), `main` with the
 * routed page, and the footer. The drawer for Overlay mode and narrow screens mounts on first use.
 * The shell has no heading: each page owns the only `h1`.
 */
@Component({
  selector: 'wjt-layout',
  imports: [MenuDrawer, RouterOutlet, Sidebar, Topbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout {
  protected readonly layout = inject(LayoutService);
  private readonly document = inject(DOCUMENT);

  /**
   * `href="#main"` would resolve against `<base href>` and leave the page, so the skip link moves
   * focus itself.
   */
  protected skipToMain(event: Event): void {
    event.preventDefault();
    this.document.getElementById('main')?.focus();
  }
}
