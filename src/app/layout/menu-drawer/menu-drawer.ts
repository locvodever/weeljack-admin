import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WjDrawer } from 'weeljack-ng/drawer';
import { LayoutService } from '../layout.service';
import { Sidebar } from '../sidebar/sidebar';

/**
 * The sidebar in a left `wj-drawer`: the one floating menu, used in Overlay mode and below 960 px.
 * `wj-drawer` moves focus in, traps Tab, closes on Escape and returns focus to the toggle; a link
 * click closes it too. The shell mounts it with `@defer`, so neither it nor Optimus's drawer is in
 * the initial bundle.
 */
@Component({
  selector: 'app-menu-drawer',
  imports: [Sidebar, WjDrawer],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <wj-drawer [(visible)]="layout.drawerOpen" header="Menu" position="left">
      <app-sidebar id="drawer-nav" idPrefix="drawer" (linkClick)="layout.closeDrawer()" />
    </wj-drawer>
  `,
})
export class MenuDrawer {
  protected readonly layout = inject(LayoutService);
}
