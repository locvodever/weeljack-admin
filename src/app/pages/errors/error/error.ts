import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ErrorState } from '../error-state/error-state';

/** `/auth/error`: a generic "something went wrong" page with one way back. */
@Component({
  selector: 'wjt-error',
  imports: [ErrorState, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './error.html',
})
export class ErrorPage {}
