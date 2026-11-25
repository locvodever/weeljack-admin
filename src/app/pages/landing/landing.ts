import { DOCUMENT, ViewportScroller } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  afterNextRender,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationSkipped, Router } from '@angular/router';
import { LayoutService } from '../../layout/layout.service';
import { LandingFeatures } from './landing-features/landing-features';
import { LandingFooter } from './landing-footer/landing-footer';
import { LandingHero } from './landing-hero/landing-hero';
import { LandingHighlights } from './landing-highlights/landing-highlights';
import { LandingPricing } from './landing-pricing/landing-pricing';
import { LandingTopbar } from './landing-topbar/landing-topbar';

/**
 * `/landing`: a product page for the made-up service desk, outside the shell. It sits beside the
 * shell route (not inside `FullPage`), so the header and footer keep their banner and contentinfo
 * landmarks, and it injects `LayoutService` for its restore side effect, as `FullPage` does.
 *
 * Section links are `routerLink` + `fragment`. The router scrolls to the fragment
 * (`withInMemoryScrolling`), and this page moves focus to the section once it has rendered, which
 * is why each section has `tabindex="-1"`. A link to the fragment the address already holds is
 * skipped by the router, so a click on it is also handled here.
 */
@Component({
  selector: 'wjt-landing',
  imports: [
    LandingTopbar,
    LandingHero,
    LandingFeatures,
    LandingHighlights,
    LandingPricing,
    LandingFooter,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing.html',
  styleUrl: './landing.css',
  host: { '(click)': 'onClick($event)' },
})
export class Landing {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly scroller = inject(ViewportScroller);

  constructor() {
    // Injected for its restore side effect; nothing here reads it.
    inject(LayoutService);

    // `afterNextRender` never runs on the server, so the prerender does no focus work.
    this.router.events.pipe(takeUntilDestroyed()).subscribe((event) => {
      const url =
        event instanceof NavigationEnd
          ? event.urlAfterRedirects
          : event instanceof NavigationSkipped
            ? event.url
            : null;
      const fragment = url === null ? null : this.router.parseUrl(url).fragment;
      if (fragment !== null) {
        afterNextRender(() => this.focusSection(fragment), { injector: this.injector });
      }
    });
  }

  /**
   * A click on a link to exactly where the router already is: scroll and focus here, whatever the
   * router does with a navigation to the same URL.
   */
  protected onClick(event: MouseEvent): void {
    if (!(event.target instanceof Element)) {
      return;
    }
    const href = event.target.closest('a')?.getAttribute('href');
    const fragment = this.router.parseUrl(this.router.url).fragment;
    // The href is the base href plus the router's URL.
    if (fragment !== null && href?.endsWith(this.router.url) === true) {
      this.scroller.scrollToAnchor(fragment);
      this.focusSection(fragment);
    }
  }

  private focusSection(id: string): void {
    this.document.getElementById(id)?.focus({ preventScroll: true });
  }
}
