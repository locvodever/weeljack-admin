import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Highlight {
  readonly title: string;
  readonly text: string;
  readonly points: readonly string[];
  readonly art: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

/** `#highlights`: two rows of text beside art, the same desk on a phone and on a desktop. */
@Component({
  selector: 'wjt-landing-highlights',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './landing-highlights.html',
  styleUrl: './landing-highlights.css',
})
export class LandingHighlights {
  protected readonly rows: readonly Highlight[] = [
    {
      title: 'On the phone in your pocket',
      text: 'Below 960 pixels the sidebar tucks into a drawer, and every control keeps a thumb-sized target.',
      points: [
        'A menu drawer in place of the sidebar',
        'Touch targets at least 44 pixels tall',
        'The page never scrolls sideways at 390 pixels',
      ],
      art: 'art/landing-phone.svg',
      alt: 'The dashboard on a phone',
      width: 320,
      height: 420,
    },
    {
      title: 'On the desk in front of you',
      text: 'From 960 pixels the sidebar docks beside the page, and from 1280 the tickets table shows every column.',
      points: [
        'A docked sidebar, or an overlay if you prefer',
        'Sortable columns, paging and multiple selection',
        'Light or dark in six presets',
      ],
      art: 'art/landing-desktop.svg',
      alt: 'The tickets table on a desktop screen',
      width: 560,
      height: 400,
    },
  ];
}
