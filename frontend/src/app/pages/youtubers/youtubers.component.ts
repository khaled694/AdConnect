import { isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Category } from '../../models/category.model';
import { YoutuberProfile } from '../../models/youtuber-profile.model';
import { CategoryService } from '../../services/category.service';
import {
  YoutuberProfileSearchFilters,
  YoutuberProfileService
} from '../../services/youtuber-profile.service';

@Component({
  selector: 'app-youtubers',
  imports: [FormsModule],
  template: `
    <section class="youtubers-page">
      <header class="page-header">
        <h1>YouTubers</h1>
        <p>Browse creators available for advertising campaigns.</p>
      </header>

      <form class="filter-panel" (ngSubmit)="searchYoutubers()">
        <div class="filter-field">
          <label for="category">Category</label>
          <select id="category" name="category" [(ngModel)]="filters.category">
            <option value="">All categories</option>
            @for (category of categories(); track category.id) {
              <option [value]="category.name">{{ category.name }}</option>
            }
          </select>
        </div>

        <div class="filter-field">
          <label for="country">Country</label>
          <input id="country" name="country" type="text" [(ngModel)]="filters.country" />
        </div>

        <div class="filter-field">
          <label for="language">Language</label>
          <input id="language" name="language" type="text" [(ngModel)]="filters.language" />
        </div>

        <div class="filter-field">
          <label for="minSubscribers">Minimum subscribers</label>
          <input
            id="minSubscribers"
            name="minSubscribers"
            type="number"
            min="0"
            [(ngModel)]="filters.minSubscribers"
          />
        </div>

        <div class="filter-field">
          <label for="minAverageViews">Minimum average views</label>
          <input
            id="minAverageViews"
            name="minAverageViews"
            type="number"
            min="0"
            [(ngModel)]="filters.minAverageViews"
          />
        </div>

        <div class="filter-field">
          <label for="maxPrice">Max price</label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            min="0"
            [(ngModel)]="filters.maxPrice"
          />
        </div>

        <div class="filter-actions">
          <button type="submit">Search</button>
          <button class="secondary-button" type="button" (click)="resetFilters()">Reset</button>
        </div>
      </form>

      @if (isLoading()) {
        <p class="state-message">Loading YouTubers...</p>
      } @else if (errorMessage()) {
        <p class="error-message">{{ errorMessage() }}</p>
      } @else if (profiles().length === 0) {
        <p class="state-message">No YouTubers found.</p>
      } @else {
        <div class="card-grid">
          @for (profile of profiles(); track profile.id) {
            <article class="youtuber-card">
              <div class="card-header">
                <h2>{{ profile.channelName }}</h2>
                <span>{{ profile.categoryName }}</span>
              </div>

              <p class="description">{{ profile.description }}</p>

              <dl class="profile-details">
                <div>
                  <dt>Country</dt>
                  <dd>{{ profile.country }}</dd>
                </div>
                <div>
                  <dt>Language</dt>
                  <dd>{{ profile.language }}</dd>
                </div>
                <div>
                  <dt>Subscribers</dt>
                  <dd>{{ profile.subscribersCount }}</dd>
                </div>
                <div>
                  <dt>Average views</dt>
                  <dd>{{ profile.averageViews }}</dd>
                </div>
                <div>
                  <dt>Price per ad</dt>
                  <dd>{{ profile.pricePerAd }}</dd>
                </div>
              </dl>

              <div class="card-actions">
                <a [href]="profile.youtubeUrl" target="_blank" rel="noopener">YouTube</a>
                <a [href]="'mailto:' + profile.contactEmail">{{ profile.contactEmail }}</a>
              </div>
            </article>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      .youtubers-page {
        margin: 0 auto;
        max-width: 1180px;
      }

      .page-header {
        margin-bottom: 24px;
      }

      .page-header h1 {
        font-size: 36px;
        margin: 0 0 8px;
      }

      .page-header p {
        color: var(--color-text-muted);
        margin: 0;
      }

      .filter-panel {
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-card);
        box-shadow: var(--shadow-card);
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
        margin-bottom: 24px;
        padding: 20px;
      }

      .filter-field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      label {
        font-weight: 600;
      }

      input,
      select {
        border: 1px solid var(--color-border-strong);
        border-radius: var(--radius-control);
        min-height: 42px;
        padding: 10px 12px;
      }

      .filter-actions {
        align-items: end;
        display: flex;
        gap: 10px;
      }

      button,
      .card-actions a {
        background: var(--color-primary);
        border: 1px solid var(--color-primary);
        border-radius: var(--radius-control);
        color: #ffffff;
        cursor: pointer;
        font-weight: 700;
        min-height: 42px;
        padding: 9px 14px;
        text-decoration: none;
      }

      .secondary-button {
        background: #ffffff;
        border-color: var(--color-border-strong);
        color: var(--color-text);
      }

      .card-grid {
        display: grid;
        gap: 20px;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      }

      .youtuber-card {
        border: 1px solid var(--color-border);
        border-radius: var(--radius-card);
        box-shadow: var(--shadow-card);
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 20px;
      }

      .card-header {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .card-header h2 {
        font-size: 20px;
        margin: 0;
      }

      .card-header span {
        background: #eaf4f3;
        border-radius: 999px;
        color: var(--color-primary);
        font-size: 12px;
        font-weight: 700;
        padding: 4px 9px;
        width: fit-content;
      }

      .description {
        color: #3d4b51;
        line-height: 1.55;
        margin: 0;
      }

      .profile-details {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin: 0;
      }

      .profile-details div {
        min-width: 0;
      }

      dt {
        color: var(--color-text-muted);
        font-size: 13px;
      }

      dd {
        margin: 2px 0 0;
      }

      .card-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: auto;
      }

      .card-actions a[href^='mailto:'] {
        background: #ffffff;
        border-color: var(--color-border-strong);
        color: var(--color-text);
        overflow-wrap: anywhere;
      }

      .state-message,
      .error-message {
        border: 1px solid var(--color-border);
        padding: 16px;
      }

      .error-message {
        color: #9f251b;
      }

      @media (max-width: 560px) {
        .profile-details {
          grid-template-columns: 1fr;
        }

        .card-actions a {
          width: 100%;
        }
      }
    `
  ]
})
export class YoutubersComponent implements OnInit {
  profiles = signal<YoutuberProfile[]>([]);
  categories = signal<Category[]>([]);
  filters: YoutuberProfileSearchFilters = this.createEmptyFilters();
  isLoading = signal(false);
  errorMessage = signal('');
  private readonly isBrowser: boolean;

  constructor(
    private readonly youtuberProfileService: YoutuberProfileService,
    private readonly categoryService: CategoryService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.loadCategories();
    this.loadAllProfiles();
  }

  searchYoutubers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.youtuberProfileService.searchProfiles(this.filters).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (profiles) => {
        this.profiles.set(profiles);
      },
      error: () => {
        this.errorMessage.set('Could not load YouTubers. Please try again.');
      }
    });
  }

  resetFilters(): void {
    this.filters = this.createEmptyFilters();
    this.loadAllProfiles();
  }

  private loadAllProfiles(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.youtuberProfileService.getAllProfiles().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (profiles) => {
        this.profiles.set(profiles);
      },
      error: () => {
        this.errorMessage.set('Could not load YouTubers. Please try again.');
      }
    });
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories.filter((category) => category.name?.trim()));
      },
      error: () => {
        this.categories.set([]);
      }
    });
  }

  private createEmptyFilters(): YoutuberProfileSearchFilters {
    return {
      category: '',
      country: '',
      language: '',
      minSubscribers: null,
      minAverageViews: null,
      maxPrice: null
    };
  }
}
