import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthResponse } from '../../models/auth-response.model';
import { Category } from '../../models/category.model';
import { CooperationRequest } from '../../models/cooperation-request.model';
import { YoutuberProfile } from '../../models/youtuber-profile.model';
import { YoutuberProfileRequest } from '../../models/youtuber-profile-request.model';
import { CategoryService } from '../../services/category.service';
import { CooperationRequestService } from '../../services/cooperation-request.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { YoutuberProfileService } from '../../services/youtuber-profile.service';

@Component({
  selector: 'app-youtuber-dashboard',
  imports: [FormsModule, NgTemplateOutlet],
  template: `
    <section class="dashboard-page">
      <header class="page-header">
        <h1>YouTuber Dashboard</h1>
        <p>Manage your creator profile and cooperation requests.</p>
      </header>

      @if (isLoading()) {
        <p class="state-message">Loading dashboard...</p>
      }

      @if (errorMessage()) {
        <p class="error-message">{{ errorMessage() }}</p>
      }

      @if (successMessage()) {
        <p class="success-message">{{ successMessage() }}</p>
      }

      @if (!isLoading() && !profile()) {
        <section class="panel">
          <h2>Create YouTuber profile</h2>
          <form class="form-grid" (ngSubmit)="createProfile()">
            <ng-container *ngTemplateOutlet="profileFormFields"></ng-container>
            <div class="form-actions full-width">
              <button type="submit" [disabled]="isSavingProfile()">Create profile</button>
            </div>
          </form>
        </section>
      }

      @if (profile()) {
        <section class="panel">
          <h2>{{ profile()?.channelName }}</h2>
          <div class="summary-grid">
            <div>
              <span>Category</span>
              <strong>{{ profile()?.categoryName }}</strong>
            </div>
            <div>
              <span>Country</span>
              <strong>{{ profile()?.country }}</strong>
            </div>
            <div>
              <span>Language</span>
              <strong>{{ profile()?.language }}</strong>
            </div>
            <div>
              <span>Subscribers</span>
              <strong>{{ profile()?.subscribersCount }}</strong>
            </div>
            <div>
              <span>Average views</span>
              <strong>{{ profile()?.averageViews }}</strong>
            </div>
            <div>
              <span>Price per ad</span>
              <strong>{{ profile()?.pricePerAd }}</strong>
            </div>
          </div>
          <p>{{ profile()?.description }}</p>
          <a class="link-button" [href]="profile()?.youtubeUrl" target="_blank" rel="noopener">Open YouTube channel</a>
        </section>

        <section class="panel">
          <h2>Edit profile</h2>
          <form class="form-grid" (ngSubmit)="updateProfile()">
            <ng-container *ngTemplateOutlet="profileFormFields"></ng-container>
            <div class="form-actions full-width">
              <button type="submit" [disabled]="isSavingProfile()">Save changes</button>
            </div>
          </form>
        </section>

        <section class="panel">
          <h2>Cooperation requests</h2>

          @if (isLoadingRequests()) {
            <p class="state-message">Loading requests...</p>
          } @else if (requests().length === 0) {
            <p class="state-message">No cooperation requests yet.</p>
          } @else {
            <div class="request-list">
              @for (request of requests(); track request.id) {
                <article class="request-card">
                  <div class="request-header">
                    <h3>{{ request.campaignTitle }}</h3>
                    <span
                      class="status-badge"
                      [class.status-pending]="request.status === 'PENDING'"
                      [class.status-accepted]="request.status === 'ACCEPTED'"
                      [class.status-rejected]="request.status === 'REJECTED'"
                    >
                      {{ request.status }}
                    </span>
                  </div>

                  <p>{{ request.message }}</p>

                  <dl>
                    <div>
                      <dt>Offered price</dt>
                      <dd>{{ request.offeredPrice }}</dd>
                    </div>
                    <div>
                      <dt>Created</dt>
                      <dd>{{ request.createdAt }}</dd>
                    </div>
                  </dl>

                  @if (request.status === 'PENDING') {
                    <div class="request-actions">
                      <button type="button" (click)="acceptRequest(request.id)">Accept</button>
                      <button class="secondary-button" type="button" (click)="rejectRequest(request.id)">Reject</button>
                    </div>
                  }
                </article>
              }
            </div>
          }
        </section>
      }

      <ng-template #profileFormFields>
        <div class="field">
          <label for="channelName">Channel name</label>
          <input id="channelName" name="channelName" required [(ngModel)]="profileForm.channelName" />
        </div>

        <div class="field">
          <label for="youtubeUrl">YouTube URL</label>
          <input id="youtubeUrl" name="youtubeUrl" type="url" required [(ngModel)]="profileForm.youtubeUrl" />
        </div>

        <div class="field">
          <label for="categoryId">Category</label>
          <select id="categoryId" name="categoryId" required [(ngModel)]="profileForm.categoryId">
            <option [ngValue]="null">Select category</option>
            @for (category of categories(); track category.id) {
              <option [ngValue]="category.id">{{ category.name }}</option>
            }
          </select>
        </div>

        <div class="field">
          <label for="country">Country</label>
          <input id="country" name="country" required [(ngModel)]="profileForm.country" />
        </div>

        <div class="field">
          <label for="language">Language</label>
          <input id="language" name="language" required [(ngModel)]="profileForm.language" />
        </div>

        <div class="field">
          <label for="subscribersCount">Subscribers</label>
          <input id="subscribersCount" name="subscribersCount" type="number" min="0" required [(ngModel)]="profileForm.subscribersCount" />
        </div>

        <div class="field">
          <label for="averageViews">Average views</label>
          <input id="averageViews" name="averageViews" type="number" min="0" required [(ngModel)]="profileForm.averageViews" />
        </div>

        <div class="field">
          <label for="pricePerAd">Price per ad</label>
          <input id="pricePerAd" name="pricePerAd" type="number" min="0" required [(ngModel)]="profileForm.pricePerAd" />
        </div>

        <div class="field">
          <label for="contactEmail">Contact email</label>
          <input id="contactEmail" name="contactEmail" type="email" required [(ngModel)]="profileForm.contactEmail" />
        </div>

        <div class="field full-width">
          <label for="description">Description</label>
          <textarea id="description" name="description" rows="4" required [(ngModel)]="profileForm.description"></textarea>
        </div>
      </ng-template>
    </section>
  `,
  styles: [
    `
      .dashboard-page {
        margin: 0 auto;
        max-width: 1000px;
      }

      .page-header,
      .panel {
        margin-bottom: 28px;
      }

      .page-header h1 {
        font-size: 36px;
      }

      .page-header h1,
      .panel h2,
      .request-card h3 {
        margin: 0;
      }

      .page-header p {
        color: var(--color-text-muted);
        margin: 8px 0 0;
      }

      .panel,
      .request-card {
        border: 1px solid var(--color-border);
        border-radius: var(--radius-card);
        padding: 20px;
      }

      .panel {
        background: var(--color-surface);
        box-shadow: var(--shadow-card);
      }

      .request-card {
        background: var(--color-surface-muted);
        box-shadow: none;
      }

      .form-grid,
      .summary-grid,
      .request-list {
        display: grid;
        gap: 16px;
      }

      .form-grid {
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        margin-top: 16px;
      }

      .summary-grid {
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        margin-top: 16px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .full-width {
        grid-column: 1 / -1;
      }

      label {
        font-weight: 600;
      }

      input,
      select,
      textarea {
        border: 1px solid var(--color-border-strong);
        border-radius: var(--radius-control);
        min-height: 42px;
        padding: 10px 12px;
      }

      button,
      .link-button {
        background: var(--color-primary);
        border: 1px solid var(--color-primary);
        border-radius: var(--radius-control);
        color: #ffffff;
        cursor: pointer;
        display: inline-block;
        font-weight: 700;
        min-height: 42px;
        padding: 9px 14px;
        text-decoration: none;
      }

      button:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }

      .secondary-button {
        background: #ffffff;
        border-color: var(--color-border-strong);
        color: var(--color-text);
      }

      .form-actions,
      .request-actions {
        display: flex;
        gap: 10px;
      }

      .summary-grid span,
      dt {
        color: var(--color-text-muted);
        display: block;
        font-size: 13px;
      }

      dl {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        margin: 0;
      }

      dd {
        margin: 2px 0 0;
      }

      .request-list {
        margin-top: 16px;
      }

      .request-card {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }

      .request-header {
        align-items: start;
        display: flex;
        gap: 12px;
        justify-content: space-between;
      }

      .status-badge {
        background: #eeeeee;
        padding: 4px 8px;
      }

      .status-pending {
        background: #fff0c2;
        color: #805500;
      }

      .status-accepted {
        background: #d9f1e1;
        color: #176135;
      }

      .status-rejected {
        background: #f9dcd8;
        color: #9b2118;
      }

      .state-message,
      .error-message,
      .success-message {
        border: 1px solid var(--color-border);
        padding: 14px;
      }

      .error-message {
        color: #9f251b;
      }

      .success-message {
        color: #23683a;
      }

      @media (max-width: 600px) {
        dl {
          grid-template-columns: 1fr;
        }

        .request-header {
          align-items: flex-start;
          flex-direction: column;
        }

        .request-actions {
          flex-direction: column;
        }

        .request-actions button {
          width: 100%;
        }
      }
    `
  ]
})
export class YoutuberDashboardComponent implements OnInit {
  profile = signal<YoutuberProfile | null>(null);
  categories = signal<Category[]>([]);
  requests = signal<CooperationRequest[]>([]);
  isLoading = signal(false);
  isSavingProfile = signal(false);
  isLoadingRequests = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  profileForm: YoutuberProfileRequest = this.createEmptyProfileForm();

  private readonly isBrowser: boolean;
  private currentUser: AuthResponse | null = null;

  constructor(
    private readonly tokenStorageService: TokenStorageService,
    private readonly youtuberProfileService: YoutuberProfileService,
    private readonly categoryService: CategoryService,
    private readonly cooperationRequestService: CooperationRequestService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.currentUser = this.tokenStorageService.getUser();
    this.loadCategories();
    this.loadProfile();
  }

  createProfile(): void {
    if (!this.currentUser) {
      this.errorMessage.set('You must be logged in to create a YouTuber profile.');
      return;
    }

    if (this.profileForm.categoryId === null) {
      this.errorMessage.set('Please select a category.');
      return;
    }

    this.isSavingProfile.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request: YoutuberProfileRequest = {
      ...this.profileForm,
      userId: this.currentUser.id
    };

    this.youtuberProfileService.createProfile(request).pipe(
      finalize(() => this.isSavingProfile.set(false))
    ).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.profileForm = this.mapProfileToForm(profile);
        this.successMessage.set('YouTuber profile created.');
        this.loadRequests(profile.id);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not create YouTuber profile.'));
      }
    });
  }

  updateProfile(): void {
    const profile = this.profile();

    if (!profile) {
      return;
    }

    if (this.profileForm.categoryId === null) {
      this.errorMessage.set('Please select a category.');
      return;
    }

    this.isSavingProfile.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.youtuberProfileService.updateProfile(profile.id, this.profileForm).pipe(
      finalize(() => this.isSavingProfile.set(false))
    ).subscribe({
      next: (updatedProfile) => {
        this.profile.set(updatedProfile);
        this.profileForm = this.mapProfileToForm(updatedProfile);
        this.successMessage.set('Profile updated.');
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not update profile.'));
      }
    });
  }

  acceptRequest(requestId: number): void {
    this.updateRequestStatus(requestId, 'accept');
  }

  rejectRequest(requestId: number): void {
    this.updateRequestStatus(requestId, 'reject');
  }

  private loadProfile(): void {
    if (!this.currentUser) {
      this.errorMessage.set('Could not find logged-in user data.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.youtuberProfileService.getAllProfiles().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (profiles) => {
        const profile = profiles.find((item) => item.userId === this.currentUser?.id) ?? null;
        this.profile.set(profile);

        if (profile) {
          this.profileForm = this.mapProfileToForm(profile);
          this.loadRequests(profile.id);
        }
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not load YouTuber profile.'));
      }
    });
  }

  private loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories.filter((category) => category.name?.trim()));
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not load categories.'));
      }
    });
  }

  private loadRequests(youtuberProfileId: number): void {
    this.isLoadingRequests.set(true);
    this.errorMessage.set('');

    this.cooperationRequestService.getRequestsByYoutuber(youtuberProfileId).pipe(
      finalize(() => this.isLoadingRequests.set(false))
    ).subscribe({
      next: (requests) => {
        this.requests.set(requests);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not load cooperation requests.'));
      }
    });
  }

  private updateRequestStatus(requestId: number, action: 'accept' | 'reject'): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    const request$ = action === 'accept'
      ? this.cooperationRequestService.acceptRequest(requestId)
      : this.cooperationRequestService.rejectRequest(requestId);

    request$.subscribe({
      next: (updatedRequest) => {
        this.requests.update((requests) => requests.map((request) => (
          request.id === updatedRequest.id ? updatedRequest : request
        )));
        this.successMessage.set(action === 'accept' ? 'Request accepted.' : 'Request rejected.');
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, `Could not ${action} request.`));
      }
    });
  }

  private createEmptyProfileForm(): YoutuberProfileRequest {
    return {
      userId: 0,
      categoryId: null,
      channelName: '',
      youtubeUrl: '',
      description: '',
      country: '',
      language: '',
      subscribersCount: 0,
      averageViews: 0,
      pricePerAd: 0,
      contactEmail: ''
    };
  }

  private mapProfileToForm(profile: YoutuberProfile): YoutuberProfileRequest {
    return {
      userId: profile.userId,
      categoryId: profile.categoryId,
      channelName: profile.channelName,
      youtubeUrl: profile.youtubeUrl,
      description: profile.description,
      country: profile.country,
      language: profile.language,
      subscribersCount: profile.subscribersCount,
      averageViews: profile.averageViews,
      pricePerAd: profile.pricePerAd,
      contactEmail: profile.contactEmail
    };
  }

  private getErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    return error.error?.message ?? fallbackMessage;
  }
}
