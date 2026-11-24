import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ErrorState } from '../error-state/error-state';

/** `/auth/access`: shown when an account cannot open a page. */
@Component({
  selector: 'app-access',
  imports: [ErrorState, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './access.html',
})
export class Access {}
