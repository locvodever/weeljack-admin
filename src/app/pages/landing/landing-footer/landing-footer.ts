import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/** The landing page's footer: link columns, "Built with WeeljackNg" and the MIT notice. */
@Component({
  selector: 'app-landing-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-footer.html',
  styleUrl: './landing-footer.css',
})
export class LandingFooter {
  protected readonly repoUrl = 'https://github.com/locvodever/weeljack-admin';
  protected readonly libraryUrl = 'https://www.npmjs.com/package/weeljack-ng';
}
