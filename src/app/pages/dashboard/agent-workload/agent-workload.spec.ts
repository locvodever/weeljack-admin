import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideWeeljack } from 'weeljack-ng';
import { wjPolice } from 'weeljack-ng/preset-police';
import { describe, expect, it } from 'vitest';
import type { AgentWorkload } from '../../../data/models';
import { AgentWorkloadList } from './agent-workload';

const WORKLOAD: readonly AgentWorkload[] = [
  { agent: { id: 'a1', name: 'Mara Okafor', capacity: 6 }, open: 5, percent: 83 },
  { agent: { id: 'a2', name: 'Jonas Lindqvist', capacity: 5 }, open: 2, percent: 40 },
];

describe('AgentWorkloadList', () => {
  async function render() {
    TestBed.configureTestingModule({
      providers: [provideWeeljack({ preset: wjPolice, darkMode: 'class' }), provideRouter([])],
    });
    const fixture = TestBed.createComponent(AgentWorkloadList);
    fixture.componentRef.setInput('workload', WORKLOAD);
    await fixture.whenStable();
    return { fixture, root: fixture.nativeElement as HTMLElement };
  }

  it('shows a row per agent with a named progress bar and its value', async () => {
    const { root } = await render();

    expect(root.querySelectorAll('li.agent').length).toBe(2);
    expect(root.querySelector('.name')?.textContent.trim()).toBe('Mara Okafor');
    expect(root.querySelector('.count')?.textContent.trim()).toBe('5 open of 6');
    const bar = root.querySelector('[role="progressbar"]');
    expect(bar?.getAttribute('aria-label')).toBe('Workload of Mara Okafor');
    expect(bar?.getAttribute('aria-valuenow')).toBe('83');
    expect(bar?.textContent).toContain('83');
  });

  it('gives each agent a named menu button that reports whether its menu is open', async () => {
    const { fixture, root } = await render();

    const button = root.querySelector<HTMLButtonElement>(
      'button[aria-label="Actions for Mara Okafor"]',
    );
    expect(button?.getAttribute('aria-haspopup')).toBe('menu');
    expect(button?.getAttribute('aria-expanded')).toBe('false');

    button?.click();
    await fixture.whenStable();
    expect(button?.getAttribute('aria-expanded')).toBe('true');
    const menu = document.body.querySelector('[role="menu"][aria-label="Actions for Mara Okafor"]');
    expect(menu?.textContent).toContain('View assigned tickets');
  });
});
