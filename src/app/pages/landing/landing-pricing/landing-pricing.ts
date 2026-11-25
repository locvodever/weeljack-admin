import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WjCard, WjCardFooterSlot, WjCardTitleSlot } from 'weeljack-ng/card';
import type { WjCardPt } from 'weeljack-ng/card';
import { WjIcon, wjIconCheck } from 'weeljack-ng/icon';

interface Tier {
  readonly name: string;
  readonly price: string;
  readonly unit: string;
  readonly audience: string;
  readonly features: readonly string[];
  readonly action: string;
  readonly path: string;
  readonly recommended: boolean;
}

/** Cards of equal height, with the action pinned to the bottom. */
const TIER_PT: WjCardPt = {
  root: { style: { display: 'flex', flexDirection: 'column', blockSize: '100%' } },
  body: { style: { display: 'flex', flexDirection: 'column', flex: '1' } },
  content: { style: { flex: '1' } },
};

/** The recommended tier adds a 2 px primary border. */
const RECOMMENDED_PT: WjCardPt = {
  ...TIER_PT,
  root: {
    style: {
      display: 'flex',
      flexDirection: 'column',
      blockSize: '100%',
      border: '2px solid var(--wj-primary-color)',
    },
  },
};

/** `#pricing`: three made-up plans. Every action is a link into the app; nothing takes payment. */
@Component({
  selector: 'wjt-landing-pricing',
  imports: [RouterLink, WjCard, WjCardFooterSlot, WjCardTitleSlot, WjIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-pricing.html',
  styleUrl: './landing-pricing.css',
})
export class LandingPricing {
  protected readonly check = wjIconCheck;
  protected readonly tierPt = TIER_PT;
  protected readonly recommendedPt = RECOMMENDED_PT;
  protected readonly tiers: readonly Tier[] = [
    {
      name: 'Starter',
      price: 'Free',
      unit: 'for ever',
      audience: 'For a small crew trying the desk.',
      features: ['Up to 3 agents', 'One shared queue', 'Light and dark schemes'],
      action: 'Open the dashboard',
      path: '/',
      recommended: false,
    },
    {
      name: 'Team',
      price: '$12',
      unit: 'per agent, a month',
      audience: 'For teams that live in the queue.',
      features: [
        'Unlimited agents',
        'Response targets for every priority',
        'CSV export of any list',
      ],
      action: 'Sign in to try Team',
      path: '/auth/login',
      recommended: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      unit: 'talk to us',
      audience: 'For desks that run across several sites.',
      features: ['Everything in Team', 'A named contact', 'Your own presets and surfaces'],
      action: 'Sign in to ask',
      path: '/auth/login',
      recommended: false,
    },
  ];
}
