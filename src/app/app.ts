import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header>weeljack-admin</header>
    <main>
      <router-outlet />
    </main>
    <footer>Released under the MIT licence.</footer>
  `,
  styles: `
    :host {
      display: block;
    }

    header,
    main,
    footer {
      box-sizing: border-box;
      max-width: 70ch;
      margin-inline: auto;
      padding: 16px;
    }

    main {
      padding-block: 32px;
    }
  `,
})
export class App {}
