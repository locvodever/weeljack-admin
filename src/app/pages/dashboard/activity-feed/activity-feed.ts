import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { relativeTime } from '../../../data/demo-time';
import type { ActivityGroup } from '../../../data/models';

/**
 * What the team did lately, in groups headed Today, Yesterday and Earlier. Each group is a
 * heading over a list; the time of an item is given relative to the demo's fixed "now".
 */
@Component({
  selector: 'app-activity-feed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'card' },
  templateUrl: './activity-feed.html',
  styleUrl: './activity-feed.css',
})
export class ActivityFeed {
  readonly groups = input.required<readonly ActivityGroup[]>();

  protected readonly relativeTime = relativeTime;
}
