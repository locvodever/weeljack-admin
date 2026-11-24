import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';
import { NAV_GROUPS, NavGroup } from '../nav-data';

/**
 * The main navigation: a disclosure tree inside `<nav aria-label="Main">`. A group holding the
 * current route is open until the reader closes it. Groups without links are not rendered.
 */
@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  /** Prefixes the list ids, so a second copy (the drawer's) never repeats an id. */
  readonly idPrefix = input.required<string>();

  /** Emitted on every link click. */
  readonly linkClick = output();

  private readonly router = inject(Router);

  private readonly path = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.split(/[?#]/, 1)[0] ?? '/'),
    ),
    { initialValue: this.router.url.split(/[?#]/, 1)[0] ?? '/' },
  );

  /** The reader's own open/closed choices; a group with none follows the current route. */
  private readonly manual = signal<ReadonlyMap<string, boolean>>(new Map());

  protected readonly groups = NAV_GROUPS.filter((group) => group.links.length > 0);

  protected readonly openIds = computed(() => {
    const manual = this.manual();
    const path = this.path();
    return new Set(
      this.groups
        .filter((group) => manual.get(group.id) ?? group.links.some((link) => link.path === path))
        .map((group) => group.id),
    );
  });

  protected toggle(group: NavGroup): void {
    const open = this.openIds().has(group.id);
    this.manual.update((manual) => new Map(manual).set(group.id, !open));
  }
}
