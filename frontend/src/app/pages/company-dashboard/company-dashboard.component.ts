import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Campaign } from '../../models/campaign.model';
import { CampaignRequest } from '../../models/campaign-request.model';
import { Category } from '../../models/category.model';
import { CompanyProfile } from '../../models/company-profile.model';
import { CompanyProfileRequest } from '../../models/company-profile-request.model';
import { CooperationRequest } from '../../models/cooperation-request.model';
import { CooperationRequestRequest } from '../../models/cooperation-request-request.model';
import { AuthResponse } from '../../models/auth-response.model';
import { YoutuberProfile } from '../../models/youtuber-profile.model';
import { CampaignService } from '../../services/campaign.service';
import { CategoryService } from '../../services/category.service';
import { CompanyProfileService } from '../../services/company-profile.service';
import { CooperationRequestService } from '../../services/cooperation-request.service';
import { TokenStorageService } from '../../services/token-storage.service';
import {
  YoutuberProfileSearchFilters,
  YoutuberProfileService
} from '../../services/youtuber-profile.service';

@Component({
  selector: 'app-company-dashboard',
  imports: [FormsModule],
  template: `
    <section class="dashboard-page">
      <header class="page-header">
        <h1>Company Dashboard</h1>
        <p>Manage your company profile, campaigns, and cooperation requests.</p>
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

      @if (!isLoading() && !companyProfile()) {
        <section class="panel">
          <h2>Create company profile</h2>
          <form class="form-grid" (ngSubmit)="createCompanyProfile()">
            <div class="field">
              <label for="companyName">Company name</label>
              <input id="companyName" name="companyName" required [(ngModel)]="companyForm.companyName" />
            </div>

            <div class="field">
              <label for="industry">Industry</label>
              <input id="industry" name="industry" required [(ngModel)]="companyForm.industry" />
            </div>

            <div class="field">
              <label for="website">Website</label>
              <input id="website" name="website" type="url" [(ngModel)]="companyForm.website" />
            </div>

            <div class="field">
              <label for="contactEmail">Contact email</label>
              <input id="contactEmail" name="contactEmail" type="email" required [(ngModel)]="companyForm.contactEmail" />
            </div>

            <div class="field full-width">
              <label for="companyDescription">Description</label>
              <textarea id="companyDescription" name="companyDescription" rows="4" [(ngModel)]="companyForm.description"></textarea>
            </div>

            <div class="form-actions full-width">
              <button type="submit" [disabled]="isSavingProfile()">Create profile</button>
            </div>
          </form>
        </section>
      }

      @if (companyProfile()) {
        <section class="panel">
          <h2>{{ companyProfile()?.companyName }}</h2>
          <div class="summary-grid">
            <div>
              <span>Industry</span>
              <strong>{{ companyProfile()?.industry }}</strong>
            </div>
            <div>
              <span>Contact</span>
              <strong>{{ companyProfile()?.contactEmail }}</strong>
            </div>
            <div>
              <span>Website</span>
              <a [href]="companyProfile()?.website" target="_blank" rel="noopener">{{ companyProfile()?.website }}</a>
            </div>
          </div>
          <p>{{ companyProfile()?.description }}</p>
        </section>

        <section class="panel">
          <h2>Create campaign</h2>
          <form class="form-grid" (ngSubmit)="createCampaign()">
            <div class="field">
              <label for="campaignTitle">Title</label>
              <input id="campaignTitle" name="campaignTitle" required [(ngModel)]="campaignForm.title" />
            </div>

            <div class="field">
              <label for="campaignType">Campaign type</label>
              <input id="campaignType" name="campaignType" required [(ngModel)]="campaignForm.campaignType" />
            </div>

            <div class="field">
              <label for="budget">Budget</label>
              <input id="budget" name="budget" type="number" min="0" required [(ngModel)]="campaignForm.budget" />
            </div>

            <div class="field">
              <label for="deadline">Deadline</label>
              <input id="deadline" name="deadline" type="date" required [(ngModel)]="campaignForm.deadline" />
            </div>

            <div class="field">
              <label for="targetCategoryId">Target category</label>
              <select id="targetCategoryId" name="targetCategoryId" required [(ngModel)]="campaignForm.targetCategoryId">
                <option [ngValue]="null">Select category</option>
                @for (category of categories(); track category.id) {
                  <option [ngValue]="category.id">{{ category.name }}</option>
                }
              </select>
            </div>

            <div class="field full-width">
              <label for="campaignDescription">Description</label>
              <textarea id="campaignDescription" name="campaignDescription" rows="4" required [(ngModel)]="campaignForm.description"></textarea>
            </div>

            <div class="form-actions full-width">
              <button type="submit" [disabled]="isSavingCampaign()">Create campaign</button>
            </div>
          </form>
        </section>

        <section class="panel">
          <h2>Your campaigns</h2>

          @if (isLoadingCampaigns()) {
            <p class="state-message">Loading campaigns...</p>
          } @else if (campaigns().length === 0) {
            <p class="state-message">No campaigns yet.</p>
          } @else {
            <div class="campaign-list">
              @for (campaign of campaigns(); track campaign.id) {
                <article class="campaign-card">
                  <div>
                    <h3>{{ campaign.title }}</h3>
                    <p>{{ campaign.description }}</p>
                  </div>
                  <dl>
                    <div>
                      <dt>Type</dt>
                      <dd>{{ campaign.campaignType }}</dd>
                    </div>
                    <div>
                      <dt>Category</dt>
                      <dd>{{ campaign.targetCategoryName }}</dd>
                    </div>
                    <div>
                      <dt>Budget</dt>
                      <dd>{{ campaign.budget }}</dd>
                    </div>
                    <div>
                      <dt>Deadline</dt>
                      <dd>{{ campaign.deadline }}</dd>
                    </div>
                  </dl>
                  <div class="campaign-actions">
                    <button type="button" (click)="toggleCampaignRequests(campaign.id)">
                      {{ getCampaignRequestPanel(campaign.id).isVisible ? 'Hide requests' : 'View requests' }}
                    </button>
                    <button class="danger-button" type="button" (click)="deleteCampaign(campaign.id)">Delete</button>
                  </div>

                  @if (getCampaignRequestPanel(campaign.id).isVisible) {
                    <div class="campaign-requests">
                      @if (getCampaignRequestPanel(campaign.id).isLoading) {
                        <p class="state-message compact">Loading requests...</p>
                      } @else if (getCampaignRequestPanel(campaign.id).errorMessage) {
                        <p class="error-message compact">{{ getCampaignRequestPanel(campaign.id).errorMessage }}</p>
                      } @else if (getCampaignRequestPanel(campaign.id).requests.length === 0) {
                        <p class="state-message compact">No requests for this campaign yet.</p>
                      } @else {
                        <div class="campaign-request-list">
                          @for (request of getCampaignRequestPanel(campaign.id).requests; track request.id) {
                            <article class="campaign-request-card">
                              <strong>{{ request.channelName }}</strong>
                              <p>{{ request.message }}</p>
                              <dl>
                                <div>
                                  <dt>Offered price</dt>
                                  <dd>{{ request.offeredPrice }}</dd>
                                </div>
                                <div>
                                  <dt>Status</dt>
                                  <dd>
                                    <span
                                      class="status-badge"
                                      [class.status-pending]="request.status === 'PENDING'"
                                      [class.status-accepted]="request.status === 'ACCEPTED'"
                                      [class.status-rejected]="request.status === 'REJECTED'"
                                    >
                                      {{ request.status }}
                                    </span>
                                  </dd>
                                </div>
                                <div>
                                  <dt>Created</dt>
                                  <dd>{{ request.createdAt }}</dd>
                                </div>
                              </dl>
                            </article>
                          }
                        </div>
                      }
                    </div>
                  }
                </article>
              }
            </div>
          }
        </section>

        <section class="panel">
          <h2>Find YouTubers</h2>
          <form class="filter-panel" (ngSubmit)="searchYoutubers()">
            <div class="field">
              <label for="category">Category</label>
              <select id="category" name="category" [(ngModel)]="youtuberFilters.category">
                <option value="">All categories</option>
                @for (category of categories(); track category.id) {
                  <option [value]="category.name">{{ category.name }}</option>
                }
              </select>
            </div>

            <div class="field">
              <label for="country">Country</label>
              <input id="country" name="country" [(ngModel)]="youtuberFilters.country" />
            </div>

            <div class="field">
              <label for="language">Language</label>
              <input id="language" name="language" [(ngModel)]="youtuberFilters.language" />
            </div>

            <div class="field">
              <label for="minSubscribers">Minimum subscribers</label>
              <input id="minSubscribers" name="minSubscribers" type="number" min="0" [(ngModel)]="youtuberFilters.minSubscribers" />
            </div>

            <div class="field">
              <label for="minAverageViews">Minimum average views</label>
              <input id="minAverageViews" name="minAverageViews" type="number" min="0" [(ngModel)]="youtuberFilters.minAverageViews" />
            </div>

            <div class="field">
              <label for="maxPrice">Max price</label>
              <input id="maxPrice" name="maxPrice" type="number" min="0" [(ngModel)]="youtuberFilters.maxPrice" />
            </div>

            <div class="filter-actions">
              <button type="submit">Search</button>
              <button class="secondary-button" type="button" (click)="resetYoutuberSearch()">Reset</button>
            </div>
          </form>

          @if (isLoadingYoutubers()) {
            <p class="state-message">Loading YouTubers...</p>
          } @else if (youtubers().length === 0) {
            <p class="state-message">No YouTubers found.</p>
          } @else {
            <div class="youtuber-grid">
              @for (profile of youtubers(); track profile.id) {
                <article class="youtuber-card">
                  <div class="card-header">
                    <h3>{{ profile.channelName }}</h3>
                    <span>{{ profile.categoryName }}</span>
                  </div>

                  <p>{{ profile.description }}</p>

                  <dl>
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

                  <a class="link-button" [href]="profile.youtubeUrl" target="_blank" rel="noopener">YouTube</a>

                  <div class="request-box">
                    <h4>Send cooperation request</h4>
                    <label [for]="'campaign-' + profile.id">Campaign</label>
                    <select
                      [id]="'campaign-' + profile.id"
                      [name]="'campaign-' + profile.id"
                      [ngModel]="getRequestForm(profile.id).campaignId"
                      (ngModelChange)="updateRequestForm(profile.id, 'campaignId', $event)"
                    >
                      <option [ngValue]="null">Select campaign</option>
                      @for (campaign of campaigns(); track campaign.id) {
                        <option [ngValue]="campaign.id">{{ campaign.title }}</option>
                      }
                    </select>

                    <label [for]="'offeredPrice-' + profile.id">Offered price</label>
                    <input
                      [id]="'offeredPrice-' + profile.id"
                      [name]="'offeredPrice-' + profile.id"
                      type="number"
                      min="0"
                      [ngModel]="getRequestForm(profile.id).offeredPrice"
                      (ngModelChange)="updateRequestForm(profile.id, 'offeredPrice', $event)"
                    />

                    <label [for]="'message-' + profile.id">Message</label>
                    <textarea
                      [id]="'message-' + profile.id"
                      [name]="'message-' + profile.id"
                      rows="3"
                      [ngModel]="getRequestForm(profile.id).message"
                      (ngModelChange)="updateRequestForm(profile.id, 'message', $event)"
                    ></textarea>

                    <button
                      type="button"
                      [disabled]="getRequestForm(profile.id).isSending || campaigns().length === 0"
                      (click)="sendCooperationRequest(profile.id)"
                    >
                      Send Request
                    </button>

                    @if (getRequestForm(profile.id).successMessage) {
                      <p class="success-message compact">{{ getRequestForm(profile.id).successMessage }}</p>
                    }

                    @if (getRequestForm(profile.id).errorMessage) {
                      <p class="error-message compact">{{ getRequestForm(profile.id).errorMessage }}</p>
                    }
                  </div>
                </article>
              }
            </div>
          }
        </section>
      }
    </section>
  `,
  styles: [
    `
      .dashboard-page {
        margin: 0 auto;
        max-width: 1180px;
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
      .campaign-card h3,
      .youtuber-card h3 {
        margin: 0;
      }

      .page-header p {
        color: var(--color-text-muted);
        margin: 8px 0 0;
      }

      .panel,
      .campaign-card,
      .youtuber-card {
        border: 1px solid var(--color-border);
        border-radius: var(--radius-card);
        padding: 20px;
      }

      .panel {
        background: var(--color-surface);
        box-shadow: var(--shadow-card);
      }

      .campaign-card,
      .youtuber-card {
        background: var(--color-surface-muted);
        box-shadow: none;
      }

      .form-grid,
      .filter-panel {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
        margin-top: 16px;
      }

      .field,
      .request-box {
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

      .danger-button {
        background: var(--color-danger);
        border-color: var(--color-danger);
        width: fit-content;
      }

      .campaign-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .form-actions,
      .filter-actions {
        align-items: end;
        display: flex;
        gap: 10px;
      }

      .summary-grid,
      .campaign-list,
      .youtuber-grid {
        display: grid;
        gap: 16px;
      }

      .summary-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        margin-top: 16px;
      }

      .summary-grid span,
      dt {
        color: var(--color-text-muted);
        display: block;
        font-size: 13px;
      }

      .campaign-list,
      .youtuber-grid {
        margin-top: 16px;
      }

      .youtuber-grid {
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }

      .campaign-card,
      .youtuber-card {
        display: flex;
        flex-direction: column;
        gap: 14px;
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

      .card-header {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .card-header span {
        color: var(--color-text-muted);
      }

      .request-box {
        background: #eef4f4;
        border-radius: var(--radius-control);
        padding: 14px;
      }

      .request-box h4 {
        margin: 0 0 4px;
      }

      .campaign-requests {
        background: #eef4f4;
        border-radius: var(--radius-control);
        padding: 14px;
      }

      .campaign-request-list {
        display: grid;
        gap: 10px;
      }

      .campaign-request-card {
        background: #ffffff;
        border: 1px solid var(--color-border);
        border-radius: var(--radius-control);
        padding: 12px;
      }

      .campaign-request-card p {
        margin: 8px 0;
      }

      .status-badge {
        background: #eeeeee;
        display: inline-block;
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

      .compact {
        margin: 4px 0 0;
        padding: 8px;
      }

      @media (max-width: 600px) {
        dl {
          grid-template-columns: 1fr;
        }

        .form-actions,
        .filter-actions {
          align-items: stretch;
          flex-direction: column;
        }

        .form-actions button,
        .filter-actions button {
          width: 100%;
        }
      }
    `
  ]
})
export class CompanyDashboardComponent implements OnInit {
  companies = signal<CompanyProfile[]>([]);
  companyProfile = signal<CompanyProfile | null>(null);
  campaigns = signal<Campaign[]>([]);
  categories = signal<Category[]>([]);
  youtubers = signal<YoutuberProfile[]>([]);
  requestForms = signal<Record<number, CooperationRequestFormState>>({});
  campaignRequestPanels = signal<Record<number, CampaignRequestPanelState>>({});
  isLoading = signal(false);
  isSavingProfile = signal(false);
  isSavingCampaign = signal(false);
  isLoadingCampaigns = signal(false);
  isLoadingYoutubers = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  companyForm: CompanyProfileRequest = this.createEmptyCompanyForm();
  campaignForm: CampaignRequest = this.createEmptyCampaignForm();
  youtuberFilters: YoutuberProfileSearchFilters = this.createEmptyYoutuberFilters();

  private readonly isBrowser: boolean;
  private currentUser: AuthResponse | null = null;

  constructor(
    private readonly tokenStorageService: TokenStorageService,
    private readonly companyProfileService: CompanyProfileService,
    private readonly campaignService: CampaignService,
    private readonly categoryService: CategoryService,
    private readonly youtuberProfileService: YoutuberProfileService,
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
    this.loadCompanyProfile();
  }

  createCompanyProfile(): void {
    if (!this.currentUser) {
      this.errorMessage.set('You must be logged in to create a company profile.');
      return;
    }

    this.isSavingProfile.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request: CompanyProfileRequest = {
      ...this.companyForm,
      userId: this.currentUser.id
    };

    this.companyProfileService.createCompany(request).pipe(
      finalize(() => this.isSavingProfile.set(false))
    ).subscribe({
      next: (profile) => {
        this.companyProfile.set(profile);
        this.companyForm = this.createEmptyCompanyForm();
        this.successMessage.set('Company profile created.');
        this.loadCampaigns(profile.id);
        this.loadYoutubers();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not create company profile.'));
      }
    });
  }

  createCampaign(): void {
    const companyProfile = this.companyProfile();

    if (!companyProfile) {
      this.errorMessage.set('Create a company profile before creating campaigns.');
      return;
    }

    if (this.campaignForm.targetCategoryId === null) {
      this.errorMessage.set('Please select a target category.');
      return;
    }

    this.isSavingCampaign.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const request: CampaignRequest = {
      ...this.campaignForm,
      companyProfileId: companyProfile.id
    };

    this.campaignService.createCampaign(request).pipe(
      finalize(() => this.isSavingCampaign.set(false))
    ).subscribe({
      next: () => {
        this.campaignForm = this.createEmptyCampaignForm();
        this.successMessage.set('Campaign created.');
        this.loadCampaigns(companyProfile.id);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not create campaign.'));
      }
    });
  }

  deleteCampaign(campaignId: number): void {
    const companyProfile = this.companyProfile();

    if (!companyProfile) {
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');

    this.campaignService.deleteCampaign(campaignId).subscribe({
      next: () => {
        this.successMessage.set('Campaign deleted.');
        this.loadCampaigns(companyProfile.id);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not delete campaign.'));
      }
    });
  }

  getCampaignRequestPanel(campaignId: number): CampaignRequestPanelState {
    return this.campaignRequestPanels()[campaignId] ?? this.createEmptyCampaignRequestPanel();
  }

  toggleCampaignRequests(campaignId: number): void {
    const panel = this.getCampaignRequestPanel(campaignId);

    if (panel.isVisible) {
      this.patchCampaignRequestPanel(campaignId, { isVisible: false });
      return;
    }

    this.patchCampaignRequestPanel(campaignId, { isVisible: true });

    if (!panel.hasLoaded) {
      this.loadCampaignRequests(campaignId);
    }
  }

  searchYoutubers(): void {
    this.isLoadingYoutubers.set(true);
    this.errorMessage.set('');

    this.youtuberProfileService.searchProfiles(this.youtuberFilters).pipe(
      finalize(() => this.isLoadingYoutubers.set(false))
    ).subscribe({
      next: (profiles) => {
        this.youtubers.set(profiles);
        this.initializeRequestForms(profiles);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not load YouTubers.'));
      }
    });
  }

  resetYoutuberSearch(): void {
    this.youtuberFilters = this.createEmptyYoutuberFilters();
    this.loadYoutubers();
  }

  getRequestForm(youtuberProfileId: number): CooperationRequestFormState {
    return this.requestForms()[youtuberProfileId] ?? this.createEmptyRequestForm();
  }

  updateRequestForm<K extends keyof CooperationRequestFormState>(
    youtuberProfileId: number,
    key: K,
    value: CooperationRequestFormState[K]
  ): void {
    const current = this.getRequestForm(youtuberProfileId);

    this.requestForms.update((forms) => ({
      ...forms,
      [youtuberProfileId]: {
        ...current,
        [key]: value,
        errorMessage: '',
        successMessage: ''
      }
    }));
  }

  sendCooperationRequest(youtuberProfileId: number): void {
    const form = this.getRequestForm(youtuberProfileId);

    if (form.campaignId === null || form.offeredPrice === null) {
      this.patchRequestForm(youtuberProfileId, {
        errorMessage: 'Select a campaign and enter an offered price.'
      });
      return;
    }

    const request: CooperationRequestRequest = {
      campaignId: form.campaignId,
      youtuberProfileId,
      message: form.message,
      offeredPrice: form.offeredPrice
    };

    this.patchRequestForm(youtuberProfileId, {
      isSending: true,
      errorMessage: '',
      successMessage: ''
    });

    this.cooperationRequestService.createRequest(request).pipe(
      finalize(() => this.patchRequestForm(youtuberProfileId, { isSending: false }))
    ).subscribe({
      next: (createdRequest) => {
        this.patchRequestForm(youtuberProfileId, {
          message: '',
          offeredPrice: null,
          successMessage: 'Request sent.'
        });
        this.addRequestToCampaignPanel(request.campaignId, createdRequest);
      },
      error: (error: HttpErrorResponse) => {
        this.patchRequestForm(youtuberProfileId, {
          errorMessage: this.getErrorMessage(error, 'Could not send request.')
        });
      }
    });
  }

  private loadCompanyProfile(): void {
    if (!this.currentUser) {
      this.errorMessage.set('Could not find logged-in user data.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.companyProfileService.getAllCompanies().pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (companies) => {
        this.companies.set(companies);
        const profile = companies.find((company) => company.userId === this.currentUser?.id) ?? null;
        this.companyProfile.set(profile);

        if (profile) {
          this.loadCampaigns(profile.id);
          this.loadYoutubers();
        }
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not load company profile.'));
      }
    });
  }

  private loadCampaigns(companyProfileId: number): void {
    this.isLoadingCampaigns.set(true);

    this.campaignService.getCampaignsByCompany(companyProfileId).pipe(
      finalize(() => this.isLoadingCampaigns.set(false))
    ).subscribe({
      next: (campaigns) => {
        this.campaigns.set(campaigns);
        this.initializeCampaignRequestPanels(campaigns);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not load campaigns.'));
      }
    });
  }

  private loadCampaignRequests(campaignId: number): void {
    this.patchCampaignRequestPanel(campaignId, {
      isLoading: true,
      errorMessage: ''
    });

    this.cooperationRequestService.getRequestsByCampaign(campaignId).pipe(
      finalize(() => this.patchCampaignRequestPanel(campaignId, { isLoading: false }))
    ).subscribe({
      next: (requests) => {
        this.patchCampaignRequestPanel(campaignId, {
          requests,
          hasLoaded: true
        });
      },
      error: (error: HttpErrorResponse) => {
        this.patchCampaignRequestPanel(campaignId, {
          errorMessage: this.getErrorMessage(error, 'Could not load requests for this campaign.')
        });
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

  private loadYoutubers(): void {
    this.isLoadingYoutubers.set(true);

    this.youtuberProfileService.getAllProfiles().pipe(
      finalize(() => this.isLoadingYoutubers.set(false))
    ).subscribe({
      next: (profiles) => {
        this.youtubers.set(profiles);
        this.initializeRequestForms(profiles);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not load YouTubers.'));
      }
    });
  }

  private initializeRequestForms(profiles: YoutuberProfile[]): void {
    this.requestForms.update((forms) => {
      const nextForms = { ...forms };

      profiles.forEach((profile) => {
        nextForms[profile.id] = nextForms[profile.id] ?? this.createEmptyRequestForm();
      });

      return nextForms;
    });
  }

  private initializeCampaignRequestPanels(campaigns: Campaign[]): void {
    this.campaignRequestPanels.update((panels) => {
      const nextPanels = { ...panels };

      campaigns.forEach((campaign) => {
        nextPanels[campaign.id] = nextPanels[campaign.id] ?? this.createEmptyCampaignRequestPanel();
      });

      return nextPanels;
    });
  }

  private patchRequestForm(youtuberProfileId: number, patch: Partial<CooperationRequestFormState>): void {
    const current = this.getRequestForm(youtuberProfileId);

    this.requestForms.update((forms) => ({
      ...forms,
      [youtuberProfileId]: {
        ...current,
        ...patch
      }
    }));
  }

  private patchCampaignRequestPanel(campaignId: number, patch: Partial<CampaignRequestPanelState>): void {
    const current = this.getCampaignRequestPanel(campaignId);

    this.campaignRequestPanels.update((panels) => ({
      ...panels,
      [campaignId]: {
        ...current,
        ...patch
      }
    }));
  }

  private addRequestToCampaignPanel(campaignId: number, request: CooperationRequest): void {
    const panel = this.getCampaignRequestPanel(campaignId);

    if (!panel.hasLoaded) {
      return;
    }

    this.patchCampaignRequestPanel(campaignId, {
      requests: [request, ...panel.requests]
    });
  }

  private createEmptyCompanyForm(): CompanyProfileRequest {
    return {
      userId: 0,
      companyName: '',
      industry: '',
      website: '',
      description: '',
      contactEmail: ''
    };
  }

  private createEmptyCampaignForm(): CampaignRequest {
    return {
      companyProfileId: 0,
      targetCategoryId: null,
      title: '',
      description: '',
      campaignType: '',
      budget: null,
      deadline: ''
    };
  }

  private createEmptyYoutuberFilters(): YoutuberProfileSearchFilters {
    return {
      category: '',
      country: '',
      language: '',
      minSubscribers: null,
      minAverageViews: null,
      maxPrice: null
    };
  }

  private createEmptyRequestForm(): CooperationRequestFormState {
    return {
      campaignId: null,
      offeredPrice: null,
      message: '',
      isSending: false,
      successMessage: '',
      errorMessage: ''
    };
  }

  private createEmptyCampaignRequestPanel(): CampaignRequestPanelState {
    return {
      isVisible: false,
      isLoading: false,
      hasLoaded: false,
      requests: [],
      errorMessage: ''
    };
  }

  private getErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    return error.error?.message ?? fallbackMessage;
  }
}

interface CooperationRequestFormState {
  campaignId: number | null;
  offeredPrice: number | null;
  message: string;
  isSending: boolean;
  successMessage: string;
  errorMessage: string;
}

interface CampaignRequestPanelState {
  isVisible: boolean;
  isLoading: boolean;
  hasLoaded: boolean;
  requests: CooperationRequest[];
  errorMessage: string;
}
