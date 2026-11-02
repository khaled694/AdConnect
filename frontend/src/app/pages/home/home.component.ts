import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Role } from '../../models/role.model';
import { TokenStorageService } from '../../services/token-storage.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <section class="home-page">
      <section class="hero-section">
        <div class="hero-content">
          <span class="app-name">AdConnect</span>
          <h1>Connect brands with the right YouTubers</h1>
          <p>
            AdConnect helps companies create advertising campaigns and cooperate with YouTubers
            based on category, audience, language, country, and price.
          </p>

          <div class="hero-actions">
            <a class="button-link primary-button" routerLink="/youtubers">Browse YouTubers</a>

            @if (isLoggedIn()) {
              <a class="button-link secondary-button" [routerLink]="dashboardRoute()">Go to dashboard</a>
            } @else {
              <a class="button-link secondary-button" routerLink="/register">Create account</a>
            }
          </div>
        </div>
      </section>

      <section class="content-section">
        <div class="section-heading">
          <h2>How it works</h2>
          <p>Each role has a focused workspace for the advertising cooperation flow.</p>
        </div>

        <div class="card-grid three-columns">
          <article class="info-card">
            <h3>For Companies</h3>
            <p>Create company profile, launch campaigns, send cooperation requests.</p>
          </article>

          <article class="info-card">
            <h3>For YouTubers</h3>
            <p>Create channel profile, receive offers, accept or reject campaigns.</p>
          </article>

          <article class="info-card">
            <h3>For Admins</h3>
            <p>Manage categories, users, and platform data.</p>
          </article>
        </div>
      </section>

      <section class="content-section">
        <div class="section-heading">
          <h2>Platform features</h2>
          <p>Simple tools for discovering creators and managing campaign cooperation.</p>
        </div>

        <div class="card-grid feature-grid">
          <article class="feature-card">
            <h3>YouTuber search and filters</h3>
            <p>Browse creators by category, country, language, audience size, views, and price.</p>
          </article>

          <article class="feature-card">
            <h3>Campaign management</h3>
            <p>Companies can create campaigns with target categories, budgets, and deadlines.</p>
          </article>

          <article class="feature-card">
            <h3>Cooperation request tracking</h3>
            <p>Requests move through clear pending, accepted, and rejected statuses.</p>
          </article>

          <article class="feature-card">
            <h3>JWT-secured accounts</h3>
            <p>Authenticated users keep their session and access protected frontend routes.</p>
          </article>

          <article class="feature-card">
            <h3>Role-based dashboards</h3>
            <p>Admins, companies, and YouTubers each get the dashboard they need.</p>
          </article>
        </div>
      </section>

      <section class="cta-section">
        <div>
          <h2>Ready to start?</h2>
          <p>Create an account or continue to your dashboard.</p>
        </div>

        @if (isLoggedIn()) {
          <a class="button-link primary-button" [routerLink]="dashboardRoute()">Go to dashboard</a>
        } @else {
          <a class="button-link primary-button" routerLink="/register">Create account</a>
        }
      </section>
    </section>
  `,
  styles: [
    `
      .home-page {
        margin: 0 auto;
        max-width: 1120px;
      }

      .hero-section {
        align-items: center;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-card);
        box-shadow: var(--shadow-card);
        display: grid;
        min-height: 360px;
        padding: 48px;
      }

      .hero-content {
        max-width: 760px;
      }

      .app-name {
        color: var(--color-primary);
        display: block;
        font-weight: 700;
        margin-bottom: 12px;
        text-transform: uppercase;
      }

      h1,
      h2,
      h3,
      p {
        margin-top: 0;
      }

      h1 {
        font-size: 54px;
        line-height: 1.05;
        margin-bottom: 16px;
      }

      .hero-content p {
        color: var(--color-text-muted);
        font-size: 18px;
        line-height: 1.6;
        max-width: 720px;
      }

      .hero-actions,
      .cta-section {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .hero-actions {
        margin-top: 28px;
      }

      .content-section {
        margin-top: 52px;
      }

      .section-heading {
        margin-bottom: 18px;
        max-width: 720px;
      }

      .section-heading p,
      .feature-card p,
      .info-card p,
      .cta-section p {
        color: var(--color-text-muted);
        line-height: 1.6;
      }

      .card-grid {
        display: grid;
        gap: 20px;
      }

      .three-columns {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .feature-grid {
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      }

      .info-card,
      .feature-card {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-card);
        box-shadow: var(--shadow-card);
        padding: 22px;
      }

      .info-card h3,
      .feature-card h3 {
        margin-bottom: 8px;
      }

      .cta-section {
        align-items: center;
        background: #173b3a;
        border-radius: var(--radius-card);
        color: #ffffff;
        justify-content: space-between;
        margin-top: 48px;
        padding: 28px;
      }

      .cta-section p {
        color: #eeeeee;
        margin-bottom: 0;
      }

      .cta-section h2 {
        color: #ffffff;
      }

      .cta-section .primary-button {
        background: #ffffff;
        border-color: #ffffff;
        color: #173b3a;
      }

      .cta-section .primary-button:hover {
        background: #eaf4f3;
        border-color: #eaf4f3;
      }

      @media (max-width: 760px) {
        .hero-section {
          min-height: auto;
          padding: 28px;
        }

        h1 {
          font-size: 38px;
        }

        .three-columns {
          grid-template-columns: 1fr;
        }

        .cta-section {
          align-items: flex-start;
          flex-direction: column;
        }
      }
    `
  ]
})
export class HomeComponent {
  readonly isLoggedIn = computed(() => this.tokenStorageService.loggedInSignal());
  readonly dashboardRoute = computed(() => {
    const role = this.tokenStorageService.roleSignal();

    if (role === Role.ROLE_ADMIN) {
      return '/admin-dashboard';
    }

    if (role === Role.ROLE_COMPANY) {
      return '/company-dashboard';
    }

    return '/youtuber-dashboard';
  });

  constructor(private readonly tokenStorageService: TokenStorageService) {}
}
