import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Logo } from '../../../ui/logo/logo';

/** The landing page's footer: link columns, "Built with WeeljackNg" and the MIT notice. */
@Component({
  selector: 'wjt-landing-footer',
  imports: [Logo, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-footer.html',
  styleUrl: './landing-footer.css',
})
export class LandingFooter {
  protected readonly repoUrl = 'https://github.com/locvodever/weeljack-admin';
  protected readonly libraryUrl = 'https://www.npmjs.com/package/weeljack-ng';
}
