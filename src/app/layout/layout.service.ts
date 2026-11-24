import { DOCUMENT } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  Injector,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import type { WjPreset } from 'weeljack-ng';
import type { WjTheme } from 'weeljack-ng/theme';

export type MenuMode = 'static' | 'overlay';
export type Scheme = 'light' | 'dark';
export type PresetName = 'police' | 'aura' | 'lara' | 'material' | 'noir' | 'nora';
export type SurfaceName = 'zinc' | 'slate' | 'gray' | 'neutral' | 'stone';

interface PresetRow {
  readonly name: PresetName;
  readonly label: string;
  /** `null` for the preset `provideWeeljack` already holds: it loads nothing. */
  readonly load: (() => Promise<WjPreset>) | null;
}

/** Every preset in weeljack-ng 0.1.0, Police first. Each non-default one is its own lazy chunk. */
export const PRESETS: readonly PresetRow[] = [
  { name: 'police', label: 'Police', load: null },
  {
    name: 'aura',
    label: 'Aura',
    load: () => import('weeljack-ng/preset-aura').then((m) => m.wjAura),
  },
  {
    name: 'lara',
    label: 'Lara',
    load: () => import('weeljack-ng/preset-lara').then((m) => m.wjLara),
  },
  {
    name: 'material',
    label: 'Material',
    load: () => import('weeljack-ng/preset-material').then((m) => m.wjMaterial),
  },
  {
    name: 'noir',
    label: 'Noir',
    load: () => import('weeljack-ng/preset-noir').then((m) => m.wjNoir),
  },
  {
    name: 'nora',
    label: 'Nora',
    load: () => import('weeljack-ng/preset-nora').then((m) => m.wjNora),
  },
];

/** WjTheme's named surfaces. Slate is Police's own, so it is the one checked on a first visit. */
export const SURFACES: readonly { readonly name: SurfaceName; readonly label: string }[] = [
  { name: 'zinc', label: 'Zinc' },
  { name: 'slate', label: 'Slate' },
  { name: 'gray', label: 'Gray' },
  { name: 'neutral', label: 'Neutral' },
  { name: 'stone', label: 'Stone' },
];

export const LAYOUT_STORAGE_KEY = 'weeljack-admin:layout';

const DEFAULT_PRESET: PresetName = 'police';
const DEFAULT_SURFACE: SurfaceName = 'slate';
/** Class on `<html>` that `provideWeeljack({ darkMode: 'class' })` reads as "dark". */
const DARK_CLASS = 'wj-dark';
/** From this width the sidebar can be a column of the page; below it, it is always the drawer. */
const WIDE = '(min-width: 960px)';
const PREFERS_DARK = '(prefers-color-scheme: dark)';

interface Stored {
  preset?: PresetName;
  surface?: SurfaceName;
  scheme?: Scheme;
  menuMode?: MenuMode;
}

function isPreset(value: unknown): value is PresetName {
  return PRESETS.some((row) => row.name === value);
}

function isSurface(value: unknown): value is SurfaceName {
  return SURFACES.some((row) => row.name === value);
}

function isScheme(value: unknown): value is Scheme {
  return value === 'light' || value === 'dark';
}

function isMenuMode(value: unknown): value is MenuMode {
  return value === 'static' || value === 'overlay';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * The one owner of the shell's theme and menu state, and the only caller of `WjTheme`. The state is
 * signals; the choices (preset, surface, scheme, menu mode) are remembered as names under one
 * `localStorage` key and only a known name is restored. All browser work waits for
 * `afterNextRender`, so the server renders the defaults: Police, slate, light, Static.
 */
@Injectable({ providedIn: 'root' })
export class LayoutService {
  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly menuMode = signal<MenuMode>('static');
  readonly scheme = signal<Scheme>('light');
  /** The preset the configurator shows as chosen. It runs ahead of the one in effect while a chunk loads. */
  readonly preset = signal<PresetName>(DEFAULT_PRESET);
  readonly surface = signal<SurfaceName>(DEFAULT_SURFACE);
  /** At least 960 px wide. `true` on the server; CSS media queries carry the prerendered layout. */
  readonly isDesktop = signal(true);
  readonly drawerOpen = signal(false);
  /** Set on the first open, so the drawer's chunk loads on demand and stays. */
  readonly drawerRequested = signal(false);
  /** Static mode on a wide screen: the docked sidebar is hidden by the menu toggle. */
  readonly sidebarCollapsed = signal(false);

  /** The sidebar is a floating drawer: in Overlay mode, and always below 960 px. */
  readonly usesDrawer = computed(() => !this.isDesktop() || this.menuMode() === 'overlay');
  readonly dockedVisible = computed(() => this.menuMode() === 'static' && !this.sidebarCollapsed());
  /** What the menu toggle reports in `aria-expanded`. */
  readonly menuExpanded = computed(() =>
    this.usesDrawer() ? this.drawerOpen() : this.dockedVisible(),
  );

  private theme: WjTheme | undefined;
  /** The preset and surface really in effect: the choice runs ahead of them while a chunk loads. */
  private appliedPreset: PresetName = DEFAULT_PRESET;
  private appliedSurface: SurfaceName = DEFAULT_SURFACE;
  /** Counts preset choices, so a load of an older choice that resolves late is dropped. */
  private presetToken = 0;
  private restored = false;

  constructor() {
    afterNextRender(() => {
      void this.restore();
    });
  }

  /**
   * Reads the screen, the stored choices and the OS scheme, and applies them. Browser only; runs
   * once. The scheme, menu mode and screen apply at once; the promise settles when a stored preset
   * or surface has been applied.
   */
  restore(): Promise<void> {
    const win = this.document.defaultView;
    if (this.restored || win === null) {
      return Promise.resolve();
    }
    this.restored = true;

    const wide = win.matchMedia(WIDE);
    this.isDesktop.set(wide.matches);
    const onChange = (event: MediaQueryListEvent): void => {
      this.isDesktop.set(event.matches);
      if (event.matches && this.menuMode() === 'static') {
        this.drawerOpen.set(false);
      }
    };
    wide.addEventListener('change', onChange);
    this.destroyRef.onDestroy(() => {
      wide.removeEventListener('change', onChange);
    });

    const stored = this.read();
    this.applyScheme(stored.scheme ?? (win.matchMedia(PREFERS_DARK).matches ? 'dark' : 'light'));
    this.menuMode.set(stored.menuMode ?? 'static');
    const surface = stored.surface ?? DEFAULT_SURFACE;
    this.surface.set(surface);
    const preset = stored.preset ?? DEFAULT_PRESET;
    this.preset.set(preset);
    if (preset === DEFAULT_PRESET && surface === DEFAULT_SURFACE) {
      return Promise.resolve();
    }
    return this.applyTheme(preset, surface, ++this.presetToken).catch(() => {
      // A chunk that fails to load leaves the previous look in effect and shown as chosen.
      this.preset.set(this.appliedPreset);
      this.surface.set(this.appliedSurface);
    });
  }

  setScheme(scheme: Scheme): void {
    this.applyScheme(scheme);
    this.save();
  }

  toggleScheme(): void {
    this.setScheme(this.scheme() === 'dark' ? 'light' : 'dark');
  }

  setMenuMode(mode: MenuMode): void {
    this.menuMode.set(mode);
    if (mode === 'static' && this.isDesktop()) {
      this.drawerOpen.set(false);
    }
    this.save();
  }

  /**
   * Checks the preset's radio at once and applies the preset when its chunk has loaded. The last
   * choice wins; a failed load leaves the previous preset in effect, shown as chosen, and stores
   * nothing.
   */
  async setPreset(name: PresetName): Promise<void> {
    const token = ++this.presetToken;
    this.preset.set(name);
    try {
      await this.applyTheme(name, this.surface(), token);
    } catch {
      if (token === this.presetToken) {
        this.preset.set(this.appliedPreset);
      }
    }
  }

  async setSurface(name: SurfaceName): Promise<void> {
    const token = ++this.presetToken;
    this.surface.set(name);
    try {
      await this.applyTheme(this.preset(), name, token);
    } catch {
      if (token === this.presetToken) {
        this.surface.set(this.appliedSurface);
      }
    }
  }

  /** The menu toggle: collapses the docked sidebar, or opens and closes the drawer. */
  toggleMenu(): void {
    if (this.usesDrawer()) {
      if (this.drawerOpen()) {
        this.closeDrawer();
      } else {
        this.openDrawer();
      }
    } else {
      this.sidebarCollapsed.update((collapsed) => !collapsed);
    }
  }

  openDrawer(): void {
    this.drawerRequested.set(true);
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }

  /**
   * Puts `preset` and `surface` in effect, unless a newer choice has taken the token. Police on
   * slate is what `provideWeeljack` already renders, so while nothing else was applied it loads
   * nothing, not even `WjTheme`.
   */
  private async applyTheme(preset: PresetName, surface: SurfaceName, token: number): Promise<void> {
    const row = PRESETS.find((item) => item.name === preset);
    const value = row?.load ? await row.load() : undefined;
    if (this.theme !== undefined || value !== undefined || surface !== DEFAULT_SURFACE) {
      const theme = await this.loadTheme();
      if (token !== this.presetToken) {
        return;
      }
      theme.setPreset(value);
      theme.setSurface(`{${surface}}`);
    } else if (token !== this.presetToken) {
      return;
    }
    this.appliedPreset = preset;
    this.appliedSurface = surface;
    this.save();
  }

  /** `WjTheme` is dynamic so an app that keeps the defaults never loads the theme code. */
  private async loadTheme(): Promise<WjTheme> {
    if (this.theme === undefined) {
      const { WjTheme: Theme } = await import('weeljack-ng/theme');
      this.theme ??= this.injector.get(Theme);
    }
    return this.theme;
  }

  private applyScheme(scheme: Scheme): void {
    this.scheme.set(scheme);
    this.document.documentElement.classList.toggle(DARK_CLASS, scheme === 'dark');
  }

  private get storage(): Storage | undefined {
    try {
      return this.document.defaultView?.localStorage;
    } catch {
      return undefined;
    }
  }

  /** The stored choices, each kept only when it is a known name. */
  private read(): Stored {
    try {
      const text = this.storage?.getItem(LAYOUT_STORAGE_KEY);
      const parsed: unknown = text == null ? undefined : JSON.parse(text);
      if (!isRecord(parsed)) {
        return {};
      }
      const { preset, surface, scheme, menuMode } = parsed;
      return {
        preset: isPreset(preset) ? preset : undefined,
        surface: isSurface(surface) ? surface : undefined,
        scheme: isScheme(scheme) ? scheme : undefined,
        menuMode: isMenuMode(menuMode) ? menuMode : undefined,
      };
    } catch {
      return {};
    }
  }

  /** Stores the four choices as names, the preset being the one in effect. Storage errors are ignored. */
  private save(): void {
    try {
      this.storage?.setItem(
        LAYOUT_STORAGE_KEY,
        JSON.stringify({
          preset: this.appliedPreset,
          surface: this.surface(),
          scheme: this.scheme(),
          menuMode: this.menuMode(),
        }),
      );
    } catch {
      // Storage is disabled or full: the choice still applies, it is just not remembered.
    }
  }
}
