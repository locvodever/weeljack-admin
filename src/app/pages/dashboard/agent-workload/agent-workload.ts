import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import type { WjMenuItem } from 'weeljack-ng';
import { WjButton } from 'weeljack-ng/button';
import { WjIcon, wjIconEllipsisVertical, wjIconHeadset } from 'weeljack-ng/icon';
import { WjMenu } from 'weeljack-ng/menu';
import { WjProgressBar } from 'weeljack-ng/progressbar';
import type { AgentWorkload } from '../../../data/models';

interface Row {
  readonly workload: AgentWorkload;
  readonly items: WjMenuItem[];
}

/**
 * One row per agent: the name, a labelled progress bar and a square ⋮ button that opens a menu of
 * demo actions. The menu has no back end; it shows the pattern. The id of the agent whose menu is
 * open sets that button's `aria-expanded`.
 */
@Component({
  selector: 'app-agent-workload',
  imports: [WjButton, WjIcon, WjMenu, WjProgressBar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'card' },
  templateUrl: './agent-workload.html',
  styleUrl: './agent-workload.css',
})
export class AgentWorkloadList {
  readonly workload = input.required<readonly AgentWorkload[]>();

  protected readonly icons = { agent: wjIconHeadset, more: wjIconEllipsisVertical };
  protected readonly openId = signal<string | null>(null);

  protected readonly rows = computed<readonly Row[]>(() =>
    this.workload().map((workload) => ({
      workload,
      items: [
        {
          label: 'View assigned tickets',
          routerLink: '/tickets',
          queryParams: { assignee: workload.agent.name },
        },
        { label: 'Send a message' },
        { label: 'Mark as away' },
      ],
    })),
  );
}
