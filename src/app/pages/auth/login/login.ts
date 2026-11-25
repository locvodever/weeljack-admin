import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { WjButton } from 'weeljack-ng/button';
import { WjCheckbox } from 'weeljack-ng/checkbox';
import { WjField } from 'weeljack-ng/field';
import { WjInputText } from 'weeljack-ng/inputtext';
import { WjPassword } from 'weeljack-ng/password';

/** A plain `name@domain.tld` shape check: enough to show the pattern, it validates nothing real. */
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * `/auth/login`: a demo sign-in. Nothing is sent or stored: Sign in checks the two fields, then
 * goes to the dashboard. A blank or malformed field shows its error through `wj-field`, only after
 * the first Sign in, and focus moves to the first invalid field (Email before Password).
 */
@Component({
  selector: 'wjt-login',
  imports: [FormsModule, RouterLink, WjButton, WjCheckbox, WjField, WjInputText, WjPassword],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly router = inject(Router);
  private readonly emailInput = viewChild<ElementRef<HTMLInputElement>>('emailInput');
  private readonly passwordHost = viewChild('passwordInput', { read: ElementRef<HTMLElement> });

  protected readonly email = signal('');
  protected readonly password = signal<string | null>('');
  protected readonly remember = signal(false);
  /** Set by the first Sign in, so an error never shows before the reader tried. */
  private readonly submitted = signal(false);

  protected readonly emailError = computed(() => {
    if (!this.submitted()) {
      return undefined;
    }
    const email = this.email().trim();
    if (email === '') {
      return 'Enter your email';
    }
    return EMAIL_SHAPE.test(email) ? undefined : 'Enter an email address like name@example.com';
  });
  protected readonly passwordError = computed(() =>
    this.submitted() && (this.password() ?? '') === '' ? 'Enter your password' : undefined,
  );

  protected submit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (this.emailError() !== undefined) {
      this.emailInput()?.nativeElement.focus();
      return;
    }
    if (this.passwordError() !== undefined) {
      this.passwordHost()?.nativeElement.querySelector('input')?.focus();
      return;
    }
    void this.router.navigateByUrl('/');
  }
}
