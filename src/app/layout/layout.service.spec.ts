import { TestBed } from '@angular/core/testing';
import { WjTheme } from 'weeljack-ng/theme';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LAYOUT_STORAGE_KEY, LayoutService } from './layout.service';
import { resetLayoutEnvironment, stubMatchMedia } from './testing/environment';

function stored(): unknown {
  const text = localStorage.getItem(LAYOUT_STORAGE_KEY);
  return text === null ? null : JSON.parse(text);
}

describe('LayoutService', () => {
  let theme: { setPreset: ReturnType<typeof vi.fn>; setSurface: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    resetLayoutEnvironment();
    theme = { setPreset: vi.fn(), setSurface: vi.fn() };
    TestBed.configureTestingModule({ providers: [{ provide: WjTheme, useValue: theme }] });
  });

  afterEach(() => {
    resetLayoutEnvironment();
  });

  it('starts as Police on slate, light, Static, and loads no theme code', async () => {
    stubMatchMedia({ wide: true });
    const layout = TestBed.inject(LayoutService);
    await layout.restore();

    expect(layout.preset()).toBe('police');
    expect(layout.surface()).toBe('slate');
    expect(layout.scheme()).toBe('light');
    expect(layout.menuMode()).toBe('static');
    expect(theme.setPreset).not.toHaveBeenCalled();
    expect(theme.setSurface).not.toHaveBeenCalled();
  });

  it('follows prefers-color-scheme on a first visit and stores nothing yet', async () => {
    stubMatchMedia({ wide: true, dark: true });
    const layout = TestBed.inject(LayoutService);
    await layout.restore();

    expect(layout.scheme()).toBe('dark');
    expect(document.documentElement.classList.contains('wj-dark')).toBe(true);
    expect(stored()).toBeNull();
  });

  it('follows a light OS scheme on a first visit', async () => {
    stubMatchMedia({ wide: true, dark: false });
    const layout = TestBed.inject(LayoutService);
    await layout.restore();

    expect(layout.scheme()).toBe('light');
    expect(document.documentElement.classList.contains('wj-dark')).toBe(false);
  });

  it('persists every choice under one key, as names', async () => {
    stubMatchMedia({ wide: true });
    const layout = TestBed.inject(LayoutService);
    await layout.restore();

    layout.setScheme('dark');
    layout.setMenuMode('overlay');
    await layout.setSurface('stone');

    expect(stored()).toEqual({
      preset: 'police',
      surface: 'stone',
      scheme: 'dark',
      menuMode: 'overlay',
    });
    expect(localStorage.length).toBe(1);
  });

  it('applies a preset through WjTheme and remembers it once it is in effect', async () => {
    stubMatchMedia({ wide: true });
    const layout = TestBed.inject(LayoutService);
    await layout.restore();

    await layout.setPreset('aura');

    expect(theme.setPreset).toHaveBeenCalledTimes(1);
    expect(theme.setPreset.mock.calls[0]?.[0]).toBeTypeOf('object');
    expect(layout.preset()).toBe('aura');
    expect(stored()).toMatchObject({ preset: 'aura' });
  });

  it('goes back to the provideWeeljack preset for Police without loading one', async () => {
    stubMatchMedia({ wide: true });
    const layout = TestBed.inject(LayoutService);
    await layout.restore();
    await layout.setPreset('noir');
    theme.setPreset.mockClear();

    await layout.setPreset('police');

    expect(theme.setPreset).toHaveBeenCalledWith(undefined);
    expect(stored()).toMatchObject({ preset: 'police' });
  });

  it('lets the last preset choice win when an earlier chunk resolves late', async () => {
    stubMatchMedia({ wide: true });
    const layout = TestBed.inject(LayoutService);
    await layout.restore();

    const first = layout.setPreset('material');
    const second = layout.setPreset('nora');
    await Promise.all([first, second]);

    expect(theme.setPreset).toHaveBeenCalledTimes(1);
    expect(layout.preset()).toBe('nora');
    expect(stored()).toMatchObject({ preset: 'nora' });
  });

  it('restores the stored names, applying a non-default preset and surface', async () => {
    localStorage.setItem(
      LAYOUT_STORAGE_KEY,
      JSON.stringify({ preset: 'lara', surface: 'gray', scheme: 'dark', menuMode: 'overlay' }),
    );
    stubMatchMedia({ wide: true, dark: false });
    const layout = TestBed.inject(LayoutService);
    await layout.restore();

    expect(layout.scheme()).toBe('dark');
    expect(layout.menuMode()).toBe('overlay');
    expect(layout.preset()).toBe('lara');
    expect(layout.surface()).toBe('gray');
    expect(theme.setPreset).toHaveBeenCalledTimes(1);
    expect(theme.setSurface).toHaveBeenCalledWith('{gray}');
  });

  it('restores only known names and ignores a broken value', async () => {
    localStorage.setItem(
      LAYOUT_STORAGE_KEY,
      JSON.stringify({ preset: 'sakai', surface: 'mauve', scheme: 'sepia', menuMode: 7 }),
    );
    stubMatchMedia({ wide: true });
    const layout = TestBed.inject(LayoutService);
    await layout.restore();

    expect(layout.preset()).toBe('police');
    expect(layout.surface()).toBe('slate');
    expect(layout.scheme()).toBe('light');
    expect(layout.menuMode()).toBe('static');
    expect(theme.setPreset).not.toHaveBeenCalled();
  });

  it('survives storage that is not JSON', async () => {
    localStorage.setItem(LAYOUT_STORAGE_KEY, '{not json');
    stubMatchMedia({ wide: true });
    const layout = TestBed.inject(LayoutService);

    await expect(layout.restore()).resolves.toBeUndefined();
    expect(layout.preset()).toBe('police');
  });

  it('uses the drawer below 960 px and in Overlay mode, the docked sidebar otherwise', async () => {
    stubMatchMedia({ wide: false });
    const layout = TestBed.inject(LayoutService);
    await layout.restore();

    expect(layout.isDesktop()).toBe(false);
    expect(layout.usesDrawer()).toBe(true);
    layout.toggleMenu();
    expect(layout.drawerOpen()).toBe(true);
    expect(layout.drawerRequested()).toBe(true);
    expect(layout.menuExpanded()).toBe(true);
    layout.toggleMenu();
    expect(layout.drawerOpen()).toBe(false);

    layout.isDesktop.set(true);
    expect(layout.usesDrawer()).toBe(false);
    expect(layout.menuExpanded()).toBe(true);
    layout.toggleMenu();
    expect(layout.sidebarCollapsed()).toBe(true);
    expect(layout.menuExpanded()).toBe(false);

    layout.setMenuMode('overlay');
    expect(layout.usesDrawer()).toBe(true);
  });
});
