import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { WjIcon, wjIconHeart, wjIconTimer, wjIconTriangleExclamationPoint } from 'weeljack-ng/icon';
import type { Stat } from '../../../data/models';

/**
 * The four figures of the day, first on the page: an icon tile, the value and a delta line in
 * words. The section is named for assistive technology only; the cards need no visible heading.
 */
@Component({
  selector: 'wjt-stat-cards',
  imports: [WjIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stat-cards.html',
  styleUrl: './stat-cards.css',
})
export class StatCards {
  readonly stats = input.required<readonly Stat[]>();

  protected readonly icons = {
    sla: wjIconTriangleExclamationPoint,
    response: wjIconTimer,
    csat: wjIconHeart,
  };
}
