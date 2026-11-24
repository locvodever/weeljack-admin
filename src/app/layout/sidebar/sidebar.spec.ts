import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { Sidebar } from './sidebar';

@Component({ template: '' })
class Blank {}

async function setup(url: string) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: '', component: Blank },
        { path: 'elsewhere', component: Blank },
      ]),
    ],
  });
  await TestBed.inject(Router).navigateByUrl(url);
  const fixture = TestBed.createComponent(Sidebar);
  fixture.componentRef.setInput('idPrefix', 'test');
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  return { fixture, root };
}

describe('Sidebar', () => {
  it('is the Main navigation landmark, with only the groups that have links', async () => {
    const { root } = await setup('/');

    expect(root.querySelector('nav')?.getAttribute('aria-label')).toBe('Main');
    const heads = Array.from(root.querySelectorAll('button.head'));
    expect(heads.map((head) => head.textContent.trim())).toEqual(['Home', 'Service desk']);
  });

  it('opens the group holding the current route and marks the link as the current page', async () => {
    const { root } = await setup('/');

    const head = root.querySelector<HTMLButtonElement>('button.head');
    expect(head?.getAttribute('aria-expanded')).toBe('true');
    const list = root.querySelector<HTMLElement>(`#${head?.getAttribute('aria-controls') ?? ''}`);
    expect(list?.hidden).toBe(false);
    const link = root.querySelector('a');
    expect(link?.textContent.trim()).toBe('Dashboard');
    expect(link?.getAttribute('aria-current')).toBe('page');
  });

  it('lists Tickets under Service desk, with a decorative icon and its label as the name', async () => {
    const { root } = await setup('/');

    const link = Array.from(root.querySelectorAll('a')).find(
      (item) => item.textContent.trim() === 'Tickets',
    );
    expect(link?.getAttribute('href')).toBe('/tickets');
    expect(link?.querySelector('wj-icon svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(link?.hasAttribute('aria-label')).toBe(false);
  });

  it('draws the Dashboard icon as a decoration and keeps the label as the link name', async () => {
    const { root } = await setup('/');

    const link = root.querySelector('a');
    const icon = link?.querySelector('wj-icon svg');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');
    expect(link?.hasAttribute('aria-label')).toBe(false);
    expect(link?.textContent.trim()).toBe('Dashboard');
  });

  it('keeps a group closed when it does not hold the current route, and a click opens it', async () => {
    const { fixture, root } = await setup('/elsewhere');

    const head = root.querySelector<HTMLButtonElement>('button.head');
    expect(head?.getAttribute('aria-expanded')).toBe('false');
    expect(root.querySelector('a')?.hasAttribute('aria-current')).toBe(false);

    head?.click();
    await fixture.whenStable();
    expect(head?.getAttribute('aria-expanded')).toBe('true');
    expect(root.querySelector<HTMLElement>('ul.links')?.hidden).toBe(false);

    head?.click();
    await fixture.whenStable();
    expect(head?.getAttribute('aria-expanded')).toBe('false');
    expect(root.querySelector<HTMLElement>('ul.links')?.hidden).toBe(true);
  });

  it('lets the reader close the group that holds the current page', async () => {
    const { fixture, root } = await setup('/');

    const head = root.querySelector<HTMLButtonElement>('button.head');
    head?.click();
    await fixture.whenStable();

    expect(head?.getAttribute('aria-expanded')).toBe('false');
  });

  it('prefixes the list id, so the drawer copy never repeats one', async () => {
    const { root } = await setup('/');

    expect(root.querySelector('button.head')?.getAttribute('aria-controls')).toBe('test-home');
    expect(root.querySelector('ul.links')?.id).toBe('test-home');
  });

  it('emits linkClick when a link is clicked', async () => {
    const { fixture, root } = await setup('/');
    let clicks = 0;
    fixture.componentInstance.linkClick.subscribe(() => {
      clicks += 1;
    });

    root.querySelector('a')?.click();

    expect(clicks).toBe(1);
  });
});
