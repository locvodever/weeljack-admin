import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WjIcon, wjIconMenu, wjIconX } from 'weeljack-ng/icon';

/**
 * The landing page's top bar: the wordmark, the three section links, Login and "View the
 * dashboard". Below 960 px the links and both actions fold behind a "Menu" disclosure button
 * (the fold itself is CSS, so the prerendered page is right at both widths); the open state is a
 * signal. Section links are `routerLink` + `fragment`, never `href="#id"`: under the app's
 * `<base href>` a bare fragment would resolve to the dashboard.
 */
@Component({
  selector: 'app-landing-topbar',
  imports: [RouterLink, WjIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-topbar.html',
  styleUrl: './landing-topbar.css',
  host: { '(keydown.escape)': 'onEscape()' },
})
export class LandingTopbar {
  protected readonly open = signal(false);
  protected readonly icons = { menu: wjIconMenu, close: wjIconX };
  protected readonly sections = [
    { label: 'Features', fragment: 'features' },
    { label: 'Highlights', fragment: 'highlights' },
    { label: 'Pricing', fragment: 'pricing' },
  ] as const;

  private readonly toggleButton = viewChild.required('toggleButton', {
    read: ElementRef<HTMLButtonElement>,
  });

  protected toggle(): void {
    this.open.update((value) => !value);
  }

  /** Choosing any link in the folded panel closes it. */
  protected close(): void {
    this.open.set(false);
  }

  /** Escape closes an open menu and returns focus to the toggle. */
  protected onEscape(): void {
    if (!this.open()) {
      return;
    }
    this.open.set(false);
    this.toggleButton().nativeElement.focus();
  }
}
