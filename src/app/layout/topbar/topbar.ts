import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewContainerRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { WjMenuItem } from 'weeljack-ng';
import { WjButton } from 'weeljack-ng/button';
import {
  WjIcon,
  wjIconEllipsisVertical,
  wjIconMenu,
  wjIconMoon,
  wjIconSun,
} from 'weeljack-ng/icon';
import { WjMenu } from 'weeljack-ng/menu';
import type { Configurator } from '../configurator/configurator';
import { LayoutService } from '../layout.service';

/**
 * The header content: the menu toggle, the wordmark and the actions. From 960 px the dark-mode
 * toggle and the configurator button sit in the bar; below it both fold into an overflow `wj-menu`.
 * The configurator is mounted on the first click, so it stays out of the initial bundle.
 */
@Component({
  selector: 'wjt-topbar',
  imports: [RouterLink, WjButton, WjIcon, WjMenu],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topbar.html',
  styleUrl: './topbar.css',
})
export class Topbar {
  protected readonly layout = inject(LayoutService);
  protected readonly icons = {
    menu: wjIconMenu,
    sun: wjIconSun,
    moon: wjIconMoon,
    overflow: wjIconEllipsisVertical,
  };

  protected readonly configuratorOpen = signal(false);
  protected readonly overflowOpen = signal(false);

  /** `aria-controls` and `aria-pressed` are not inputs of `wj-button`: they go on its button through `pt`. */
  protected readonly menuPt = computed(() => ({
    root: { 'aria-controls': this.layout.usesDrawer() ? 'drawer-nav' : 'docked-nav' },
  }));
  protected readonly darkPt = computed(() => ({
    root: { 'aria-pressed': String(this.layout.scheme() === 'dark') },
  }));

  protected readonly overflowItems = computed<WjMenuItem[]>(() => [
    {
      label: this.layout.scheme() === 'dark' ? 'Light mode' : 'Dark mode',
      command: () => {
        this.layout.toggleScheme();
      },
    },
    {
      label: 'Theme settings',
      command: (event) => {
        this.pendingConfigurator = event.originalEvent;
      },
    },
  ]);

  private readonly host = viewChild.required('configurator', { read: ViewContainerRef });
  private readonly themeButton = viewChild.required('themeButton', {
    read: ElementRef<HTMLElement>,
  });
  private readonly overflowButton = viewChild.required('overflowButton', {
    read: ElementRef<HTMLElement>,
  });
  private configurator: Promise<Configurator> | null = null;
  /** "Theme settings" was picked in the overflow menu: the popover opens once the menu has closed. */
  private pendingConfigurator: Event | null = null;

  protected toggleTheme(event: Event): void {
    this.toggleConfigurator(event, this.themeButton().nativeElement);
  }

  /** Opens the configurator beside `target`, or closes it; the first click loads its chunk. */
  private toggleConfigurator(event: Event, target: HTMLElement): void {
    this.configurator ??= import('../configurator/configurator').then(
      ({ Configurator: Popover }) => {
        const { instance } = this.host().createComponent(Popover);
        instance.opened.subscribe(() => {
          this.configuratorOpen.set(true);
        });
        instance.closed.subscribe(() => {
          this.configuratorOpen.set(false);
        });
        return instance;
      },
    );
    // `event.currentTarget` is gone after the await, so the target is passed explicitly.
    void this.configurator.then((popover) => {
      popover.toggle(event, target);
    });
  }

  /** The overflow menu has closed and handed focus back to its button: now the popover can take it. */
  protected overflowClosed(): void {
    this.overflowOpen.set(false);
    const event = this.pendingConfigurator;
    this.pendingConfigurator = null;
    if (event !== null) {
      this.toggleConfigurator(event, this.overflowButton().nativeElement);
    }
  }
}
