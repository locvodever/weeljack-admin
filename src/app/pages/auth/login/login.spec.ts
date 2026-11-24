import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideWeeljack } from 'weeljack-ng';
import { wjPolice } from 'weeljack-ng/preset-police';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Login } from './login';

async function render() {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), provideWeeljack({ preset: wjPolice, darkMode: 'class' })],
  });
  const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
  const fixture = TestBed.createComponent(Login);
  // Attached so focus is real.
  document.body.append(fixture.nativeElement as HTMLElement);
  await fixture.whenStable();
  const root = fixture.nativeElement as HTMLElement;
  return { fixture, root, navigate };
}

function setValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function byId(root: HTMLElement, id: string): HTMLElement | null {
  return root.querySelector(`[id="${id}"]`);
}

describe('Login', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('is a demo page: wordmark text, one h1, the notice, and no Forgot-password link', async () => {
    const { fixture, root } = await render();

    expect(root.querySelectorAll('h1').length).toBe(1);
    expect(root.querySelector('h1')?.textContent.trim()).toBe('Sign in');
    expect(root.textContent).toContain('weeljack-admin');
    expect(root.querySelector('.notice')?.textContent.trim()).toBe(
      'Demo only: nothing is sent or stored',
    );
    expect(root.querySelector('.notice')?.getAttribute('role')).toBeNull();
    expect(root.querySelector('a')).toBeNull();
    expect(root.querySelector('form')?.hasAttribute('action')).toBe(false);
    fixture.destroy();
  });

  it('ties every label to its control', async () => {
    const { fixture, root } = await render();

    const labels = Array.from(root.querySelectorAll('label'));
    expect(labels.map((label) => label.textContent.trim())).toEqual([
      'Email',
      'Password',
      'Remember me',
    ]);
    const targets = labels.map((label) => {
      expect(label.htmlFor, label.textContent).not.toBe('');
      return byId(root, label.htmlFor);
    });
    expect(targets.map((target) => target?.tagName)).toEqual(['INPUT', 'INPUT', 'INPUT']);
    expect(targets.map((target) => target?.getAttribute('type'))).toEqual([
      'email',
      'password',
      'checkbox',
    ]);
    expect(targets[0]?.getAttribute('autocomplete')).toBe('username');
    fixture.destroy();
  });

  it('names the show-password button and flips its name, state and the input type', async () => {
    const { fixture, root } = await render();

    const toggle = root.querySelector<HTMLButtonElement>('button.wj-password-toggle');
    const input = root.querySelector<HTMLInputElement>('input[autocomplete="current-password"]');
    expect(toggle?.tagName).toBe('BUTTON');
    expect(toggle?.getAttribute('aria-label')).toBe('Show Password');
    expect(toggle?.getAttribute('aria-pressed')).toBe('false');
    expect(input?.type).toBe('password');

    toggle?.click();
    await fixture.whenStable();

    expect(toggle?.getAttribute('aria-label')).toBe('Hide Password');
    expect(toggle?.getAttribute('aria-pressed')).toBe('true');
    expect(input?.type).toBe('text');

    toggle?.click();
    await fixture.whenStable();

    expect(toggle?.getAttribute('aria-label')).toBe('Show Password');
    expect(input?.type).toBe('password');
    fixture.destroy();
  });

  it('shows no error before the first Sign in, then both errors and focuses Email', async () => {
    const { fixture, root, navigate } = await render();
    expect(root.querySelectorAll('.wj-field-error').length).toBe(0);

    root.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await fixture.whenStable();

    const errors = Array.from(root.querySelectorAll('.wj-field-error')).map((error) =>
      error.textContent.trim(),
    );
    expect(errors).toEqual(['Enter your email', 'Enter your password']);
    const email = root.querySelector<HTMLInputElement>('input[type="email"]');
    expect(email?.getAttribute('aria-invalid')).toBe('true');
    expect(
      root.querySelector('input[autocomplete="current-password"]')?.getAttribute('aria-invalid'),
    ).toBe('true');
    expect(document.activeElement).toBe(email);
    expect(navigate).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('asks for an address shape, then for the password, and focuses each in turn', async () => {
    const { fixture, root, navigate } = await render();
    const email = root.querySelector<HTMLInputElement>('input[type="email"]');
    const submit = root.querySelector<HTMLButtonElement>('button[type="submit"]');

    setValue(email as HTMLInputElement, 'ada');
    submit?.click();
    await fixture.whenStable();
    expect(root.querySelector('.wj-field-error')?.textContent.trim()).toBe(
      'Enter an email address like name@example.com',
    );

    setValue(email as HTMLInputElement, 'ada@example.com');
    submit?.click();
    await fixture.whenStable();
    expect(
      Array.from(root.querySelectorAll('.wj-field-error')).map((error) => error.textContent.trim()),
    ).toEqual(['Enter your password']);
    expect(document.activeElement).toBe(
      root.querySelector('input[autocomplete="current-password"]'),
    );
    expect(navigate).not.toHaveBeenCalled();
    fixture.destroy();
  });

  it('goes to the dashboard on a valid Sign in and sends nothing', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const openSpy = vi.spyOn(XMLHttpRequest.prototype, 'open');
    const beaconSpy = vi.spyOn(navigator, 'sendBeacon');
    const { fixture, root, navigate } = await render();

    setValue(
      root.querySelector<HTMLInputElement>('input[type="email"]') as HTMLInputElement,
      'a@b.co',
    );
    setValue(
      root.querySelector<HTMLInputElement>(
        'input[autocomplete="current-password"]',
      ) as HTMLInputElement,
      'secret',
    );
    root.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledExactlyOnceWith('/');
    expect(root.querySelectorAll('.wj-field-error').length).toBe(0);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();
    expect(beaconSpy).not.toHaveBeenCalled();
    fixture.destroy();
  });
});
