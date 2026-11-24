import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * `/notfound`, and what the `**` route renders in place (the typed URL stays). The prerendered
 * `/notfound` is also copied to `404.html`, which GitHub Pages serves for any unknown address.
 */
@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {}
