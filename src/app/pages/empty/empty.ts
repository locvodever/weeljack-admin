import { ChangeDetectionStrategy, Component } from '@angular/core';

/** A blank page inside the shell: shows where a new screen's content goes. */
@Component({
  selector: 'wjt-empty',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './empty.html',
  styleUrl: './empty.css',
})
export class Empty {}
