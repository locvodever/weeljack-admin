import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WjCard, WjCardTitleSlot } from 'weeljack-ng/card';
import {
  WjIcon,
  wjIconDownload,
  wjIconEye,
  wjIconSun,
  wjIconTicket,
  wjIconTimer,
  wjIconUsers,
} from 'weeljack-ng/icon';
import type { WjIconDef } from 'weeljack-ng/icon';

interface Feature {
  readonly title: string;
  readonly text: string;
  readonly icon: WjIconDef;
}

/** `#features`: six cards, each describing something the demo really does. */
@Component({
  selector: 'app-landing-features',
  imports: [WjCard, WjCardTitleSlot, WjIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-features.html',
  styleUrl: './landing-features.css',
})
export class LandingFeatures {
  protected readonly features: readonly Feature[] = [
    {
      title: 'Ticket queue',
      text: 'Search, sort and page through every request, then edit or close one in a dialog.',
      icon: wjIconTicket,
    },
    {
      title: 'Response targets',
      text: 'See which requests are close to missing their reply target before they do.',
      icon: wjIconTimer,
    },
    {
      title: 'Agent workload',
      text: 'Check how many tickets each agent carries and open one person’s list in a click.',
      icon: wjIconUsers,
    },
    {
      title: 'Six looks, two schemes',
      text: 'Pick a preset and a surface, then flip between light and dark. The choice is remembered.',
      icon: wjIconSun,
    },
    {
      title: 'Keyboard first',
      text: 'Every control can be reached and named without a mouse, in both schemes.',
      icon: wjIconEye,
    },
    {
      title: 'CSV export',
      text: 'Export the filtered, sorted list as a file that opens as text and never runs as a formula.',
      icon: wjIconDownload,
    },
  ];
}
