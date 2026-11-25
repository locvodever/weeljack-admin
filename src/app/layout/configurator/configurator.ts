import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  output,
  viewChild,
} from '@angular/core';
import { WjOption } from 'weeljack-ng';
import { WjPopover } from 'weeljack-ng/popover';
import { WjSelectButton } from 'weeljack-ng/selectbutton';
import {
  LayoutService,
  MenuMode,
  PRESETS,
  PresetName,
  Scheme,
  SURFACES,
  SurfaceName,
} from '../layout.service';

/**
 * The theme configurator: a `wj-popover` holding the preset, surface, scheme and menu-mode choices.
 * Every choice applies at once through `LayoutService`, which also remembers it. The topbar mounts
 * it on the first click, so it stays out of the initial bundle.
 */
@Component({
  selector: 'app-configurator',
  imports: [WjPopover, WjSelectButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './configurator.html',
  styleUrl: './configurator.css',
})
export class Configurator {
  /** Emits once the popover is open and focus is on the checked preset. */
  readonly opened = output();
  /** Emits once per close, whatever closed it. */
  readonly closed = output();

  protected readonly layout = inject(LayoutService);
  protected readonly presets = PRESETS;
  protected readonly surfaces = SURFACES;
  protected readonly schemes: WjOption<Scheme>[] = [
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];
  protected readonly menuModes: WjOption<MenuMode>[] = [
    { label: 'Static', value: 'static' },
    { label: 'Overlay', value: 'overlay' },
  ];

  private readonly popover = viewChild.required(WjPopover);
  /** The popover moves its content to the overlay layer, so the panel is found by reference, not by host. */
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  /** Opens the popover beside `target`, or closes it when it is open. */
  toggle(event: Event, target: HTMLElement): void {
    this.popover().toggle(event, target);
  }

  /** `wj-popover` focuses its first control, which is the first preset: the checked one is the better start. */
  protected focusChecked(): void {
    this.panel()
      .nativeElement.querySelector<HTMLInputElement>('input[type="radio"]:checked')
      ?.focus();
    this.opened.emit();
  }

  protected choosePreset(name: PresetName): void {
    void this.layout.setPreset(name);
  }

  protected chooseSurface(name: SurfaceName): void {
    void this.layout.setSurface(name);
  }

  protected chooseScheme(scheme: Scheme | null): void {
    if (scheme !== null) {
      this.layout.setScheme(scheme);
    }
  }

  protected chooseMenuMode(mode: MenuMode | null): void {
    if (mode !== null) {
      this.layout.setMenuMode(mode);
    }
  }
}
