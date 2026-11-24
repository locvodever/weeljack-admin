import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1>weeljack-admin</h1>
    <p>
      This is the walking skeleton: an empty page that the build, tests and checks already cover.
    </p>
  `,
  styles: `
    h1 {
      margin: 0 0 16px;
    }

    p {
      margin: 0;
    }
  `,
})
export class Home {}
