import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The Weeljack mark: a shield split into two tones, holding the wj glyph (the j's tail runs back under
 * the w). Drawn for this template as hand-written SVG; see ASSETS.md.
 *
 * Decorative: place it beside text that names the link. Its colours come from the active preset's
 * primary, active and contrast colours, so it follows the configurator. The SVG has no ids, so it can
 * appear many times on one page and needs no `url(#…)` reference, which the app's `<base href>` breaks.
 */
@Component({
  selector: 'wjt-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './logo.html',
  styleUrl: './logo.css',
})
export class Logo {
  /** Rendered width and height, in CSS pixels. */
  readonly size = input(28);
}
