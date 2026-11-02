import { HttpErrorResponse } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginRequest } from '../../models/login-request.model';
import { Role } from '../../models/role.model';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../services/token-storage.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <section class="auth-page">
      <div class="auth-card">
        <header class="auth-header">
          <span>AdConnect</span>
          <h1>Login</h1>
          <p>Welcome back. Sign in to continue.</p>
        </header>

        <form class="form-stack" #loginForm="ngForm" (ngSubmit)="onSubmit()">
          <div>
            <label for="username">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autocomplete="username"
              required
              [(ngModel)]="request.username"
            />
          </div>

          <div>
            <label for="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              [(ngModel)]="request.password"
            />
          </div>

          <button class="btn btn-primary submit-button" type="submit" [disabled]="loginForm.invalid || isLoading()">
            {{ isLoading() ? 'Signing in...' : 'Login' }}
          </button>
        </form>

        @if (errorMessage()) {
          <p class="error-message">{{ errorMessage() }}</p>
        }
      </div>
    </section>
  `,
  styles: [
    `
      .auth-page {
        display: grid;
        min-height: calc(100vh - 170px);
        place-items: center;
      }

      .auth-card {
        max-width: 440px;
        padding: 30px;
        width: 100%;
      }

      .auth-header {
        margin-bottom: 24px;
      }

      .auth-header span {
        color: var(--color-primary);
        display: block;
        font-size: 13px;
        font-weight: 800;
        margin-bottom: 7px;
        text-transform: uppercase;
      }

      .auth-header h1 {
        margin: 0 0 8px;
      }

      .auth-header p {
        color: var(--color-text-muted);
        margin: 0;
      }

      .form-stack {
        display: grid;
        gap: 18px;
      }

      .submit-button {
        margin-top: 4px;
        width: 100%;
      }
    `
  ]
})
export class LoginComponent {
  request: LoginRequest = {
    username: '',
    password: ''
  };
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(
    private readonly authService: AuthService,
    private readonly tokenStorageService: TokenStorageService,
    private readonly router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage.set('');
    this.isLoading.set(true);

    this.authService.login(this.request).subscribe({
      next: (response) => {
        this.tokenStorageService.saveToken(response.token);
        this.tokenStorageService.saveUser(response);
        this.redirectByRole(response.role);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error));
        this.isLoading.set(false);
      }
    });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }

    if (error.status === 401 || error.status === 403) {
      return 'Invalid username or password.';
    }

    return 'Login failed. Please try again.';
  }

  private redirectByRole(role: string): void {
    if (role === Role.ROLE_ADMIN) {
      this.router.navigate(['/admin-dashboard']);
      return;
    }

    if (role === Role.ROLE_COMPANY) {
      this.router.navigate(['/company-dashboard']);
      return;
    }

    this.router.navigate(['/youtuber-dashboard']);
  }
}
