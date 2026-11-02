import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, Inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { Campaign } from '../../models/campaign.model';
import { Category } from '../../models/category.model';
import { CategoryRequest } from '../../models/category-request.model';
import { CompanyProfile } from '../../models/company-profile.model';
import { CooperationRequest } from '../../models/cooperation-request.model';
import { User } from '../../models/user.model';
import { YoutuberProfile } from '../../models/youtuber-profile.model';
import { CampaignService } from '../../services/campaign.service';
import { CategoryService } from '../../services/category.service';
import { CompanyProfileService } from '../../services/company-profile.service';
import { CooperationRequestService } from '../../services/cooperation-request.service';
import { UserService } from '../../services/user.service';
import { YoutuberProfileService } from '../../services/youtuber-profile.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [FormsModule],
  template: `
    <section class="dashboard-page">
      <header class="page-header">
        <h1>Admin Dashboard</h1>
        <p>Monitor platform activity and manage advertising categories.</p>
      </header>

      @if (isLoading()) {
        <p class="state-message">Loading admin dashboard...</p>
      }

      @if (errorMessage()) {
        <p class="error-message">{{ errorMessage() }}</p>
      }

      @if (successMessage()) {
        <p class="success-message">{{ successMessage() }}</p>
      }

      <section class="stats-grid" aria-label="Platform statistics">
        @for (card of statisticCards(); track card.label) {
          <article class="stat-card">
            <span>{{ card.label }}</span>
            <strong>{{ card.value }}</strong>
          </article>
        }
      </section>

      <section class="panel">
        <h2>Category management</h2>

        <form class="category-form" (ngSubmit)="createCategory()">
          <div class="field">
            <label for="categoryName">Name</label>
            <input id="categoryName" name="categoryName" required [(ngModel)]="createCategoryForm.name" />
          </div>

          <div class="field">
            <label for="categoryDescription">Description</label>
            <textarea
              id="categoryDescription"
              name="categoryDescription"
              rows="3"
              [(ngModel)]="createCategoryForm.description"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="submit" [disabled]="isSavingCategory()">Create category</button>
          </div>
        </form>

        @if (categories().length === 0 && !isLoading()) {
          <p class="state-message compact">No categories yet.</p>
        } @else {
          <div class="category-list">
            @for (category of categories(); track category.id) {
              <article class="category-card">
                @if (editingCategoryId() === category.id) {
                  <form class="edit-form" (ngSubmit)="updateCategory(category.id)">
                    <div class="field">
                      <label [for]="'editCategoryName-' + category.id">Name</label>
                      <input
                        [id]="'editCategoryName-' + category.id"
                        [name]="'editCategoryName-' + category.id"
                        required
                        [(ngModel)]="editCategoryForm.name"
                      />
                    </div>

                    <div class="field">
                      <label [for]="'editCategoryDescription-' + category.id">Description</label>
                      <textarea
                        [id]="'editCategoryDescription-' + category.id"
                        [name]="'editCategoryDescription-' + category.id"
                        rows="3"
                        [(ngModel)]="editCategoryForm.description"
                      ></textarea>
                    </div>

                    <div class="category-actions">
                      <button type="submit" [disabled]="isSavingCategory()">Save</button>
                      <button class="secondary-button" type="button" (click)="cancelEditCategory()">Cancel</button>
                    </div>
                  </form>
                } @else {
                  <div class="category-content">
                    <div>
                      <h3>{{ category.name }}</h3>
                      <p>{{ category.description }}</p>
                    </div>

                    <div class="category-actions">
                      <button type="button" (click)="startEditCategory(category)">Edit</button>
                      <button
                        class="danger-button"
                        type="button"
                        [disabled]="deletingCategoryId() === category.id"
                        (click)="deleteCategory(category.id)"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                }
              </article>
            }
          </div>
        }
      </section>

      <section class="panel">
        <h2>Users overview</h2>

        @if (users().length === 0 && !isLoading()) {
          <p class="state-message compact">No users found.</p>
        } @else {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                @for (user of users(); track user.id) {
                  <tr>
                    <td>{{ user.id }}</td>
                    <td>{{ user.username }}</td>
                    <td>{{ user.email }}</td>
                    <td>{{ user.role }}</td>
                    <td>{{ user.createdAt }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>

      <section class="panel">
        <h2>Requests overview</h2>

        @if (requests().length === 0 && !isLoading()) {
          <p class="state-message compact">No cooperation requests found.</p>
        } @else {
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>YouTuber</th>
                  <th>Offered price</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                @for (request of requests(); track request.id) {
                  <tr>
                    <td>{{ request.campaignTitle }}</td>
                    <td>{{ request.channelName }}</td>
                    <td>{{ request.offeredPrice }}</td>
                    <td>
                      <span
                        class="status-badge"
                        [class.status-pending]="request.status === 'PENDING'"
                        [class.status-accepted]="request.status === 'ACCEPTED'"
                        [class.status-rejected]="request.status === 'REJECTED'"
                      >
                        {{ request.status }}
                      </span>
                    </td>
                    <td>{{ request.createdAt }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </section>
  `,
  styles: [
    `
      .dashboard-page {
        margin: 0 auto;
        max-width: 1180px;
      }

      .page-header,
      .panel,
      .stats-grid {
        margin-bottom: 28px;
      }

      .page-header h1 {
        font-size: 36px;
      }

      .page-header h1,
      .panel h2,
      .category-card h3 {
        margin: 0;
      }

      .page-header p {
        color: var(--color-text-muted);
        margin: 8px 0 0;
      }

      .stats-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      }

      .stat-card,
      .panel,
      .category-card {
        border: 1px solid var(--color-border);
        border-radius: var(--radius-card);
        padding: 20px;
      }

      .stat-card,
      .panel {
        background: var(--color-surface);
        box-shadow: var(--shadow-card);
      }

      .category-card {
        background: var(--color-surface-muted);
        box-shadow: none;
      }

      .stat-card span {
        color: var(--color-text-muted);
        display: block;
        font-size: 13px;
      }

      .stat-card strong {
        display: block;
        font-size: 28px;
        margin-top: 6px;
      }

      .category-form,
      .edit-form {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
        margin-top: 16px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      label {
        font-weight: 600;
      }

      input,
      textarea {
        border: 1px solid var(--color-border-strong);
        border-radius: var(--radius-control);
        min-height: 42px;
        padding: 10px 12px;
      }

      button {
        background: var(--color-primary);
        border: 1px solid var(--color-primary);
        border-radius: var(--radius-control);
        color: #ffffff;
        cursor: pointer;
        font-weight: 700;
        min-height: 42px;
        padding: 9px 14px;
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
      }

      .form-actions,
      .category-actions {
        align-items: end;
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .category-list {
        display: grid;
        gap: 12px;
        margin-top: 16px;
      }

      .category-content {
        display: flex;
        gap: 16px;
        justify-content: space-between;
      }

      .category-content p {
        color: var(--color-text-muted);
        margin: 6px 0 0;
      }

      .table-wrapper {
        border: 1px solid var(--color-border);
        border-radius: var(--radius-control);
        overflow-x: auto;
      }

      table {
        border-collapse: collapse;
        margin-top: 16px;
        width: 100%;
      }

      th,
      td {
        border-bottom: 1px solid var(--color-border);
        padding: 12px;
        text-align: left;
        vertical-align: top;
      }

      th {
        background: var(--color-surface-muted);
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
        margin-top: 16px;
        padding: 8px;
      }

      @media (max-width: 640px) {
        .category-content {
          flex-direction: column;
        }

        .category-actions,
        .form-actions {
          align-items: stretch;
          flex-direction: column;
        }

        .category-actions button,
        .form-actions button {
          width: 100%;
        }
      }
    `
  ]
})
export class AdminDashboardComponent implements OnInit {
  users = signal<User[]>([]);
  categories = signal<Category[]>([]);
  youtubers = signal<YoutuberProfile[]>([]);
  companies = signal<CompanyProfile[]>([]);
  campaigns = signal<Campaign[]>([]);
  requests = signal<CooperationRequest[]>([]);
  isLoading = signal(false);
  isSavingCategory = signal(false);
  deletingCategoryId = signal<number | null>(null);
  editingCategoryId = signal<number | null>(null);
  errorMessage = signal('');
  successMessage = signal('');

  createCategoryForm: CategoryRequest = this.createEmptyCategoryForm();
  editCategoryForm: CategoryRequest = this.createEmptyCategoryForm();

  readonly statisticCards = computed(() => [
    { label: 'Total users', value: this.users().length },
    { label: 'Total categories', value: this.categories().length },
    { label: 'Total YouTubers', value: this.youtubers().length },
    { label: 'Total companies', value: this.companies().length },
    { label: 'Total campaigns', value: this.campaigns().length },
    { label: 'Total cooperation requests', value: this.requests().length },
    { label: 'Pending requests', value: this.countRequestsByStatus('PENDING') },
    { label: 'Accepted requests', value: this.countRequestsByStatus('ACCEPTED') },
    { label: 'Rejected requests', value: this.countRequestsByStatus('REJECTED') }
  ]);

  private readonly isBrowser: boolean;

  constructor(
    private readonly userService: UserService,
    private readonly categoryService: CategoryService,
    private readonly youtuberProfileService: YoutuberProfileService,
    private readonly companyProfileService: CompanyProfileService,
    private readonly campaignService: CampaignService,
    private readonly cooperationRequestService: CooperationRequestService,
    @Inject(PLATFORM_ID) platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.loadDashboardData();
  }

  createCategory(): void {
    const request = this.normalizeCategoryRequest(this.createCategoryForm);

    if (!request.name) {
      this.errorMessage.set('Category name is required.');
      return;
    }

    this.isSavingCategory.set(true);
    this.clearMessages();

    this.categoryService.createCategory(request).pipe(
      finalize(() => this.isSavingCategory.set(false))
    ).subscribe({
      next: (category) => {
        this.categories.update((categories) => [...categories, category]);
        this.createCategoryForm = this.createEmptyCategoryForm();
        this.successMessage.set('Category created.');
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not create category.'));
      }
    });
  }

  startEditCategory(category: Category): void {
    this.clearMessages();
    this.editingCategoryId.set(category.id);
    this.editCategoryForm = {
      name: category.name,
      description: category.description
    };
  }

  cancelEditCategory(): void {
    this.editingCategoryId.set(null);
    this.editCategoryForm = this.createEmptyCategoryForm();
  }

  updateCategory(categoryId: number): void {
    const request = this.normalizeCategoryRequest(this.editCategoryForm);

    if (!request.name) {
      this.errorMessage.set('Category name is required.');
      return;
    }

    this.isSavingCategory.set(true);
    this.clearMessages();

    this.categoryService.updateCategory(categoryId, request).pipe(
      finalize(() => this.isSavingCategory.set(false))
    ).subscribe({
      next: (updatedCategory) => {
        this.categories.update((categories) => categories.map((category) => (
          category.id === updatedCategory.id ? updatedCategory : category
        )));
        this.cancelEditCategory();
        this.successMessage.set('Category updated.');
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not update category.'));
      }
    });
  }

  deleteCategory(categoryId: number): void {
    this.deletingCategoryId.set(categoryId);
    this.clearMessages();

    this.categoryService.deleteCategory(categoryId).pipe(
      finalize(() => this.deletingCategoryId.set(null))
    ).subscribe({
      next: () => {
        this.categories.update((categories) => categories.filter((category) => category.id !== categoryId));
        if (this.editingCategoryId() === categoryId) {
          this.cancelEditCategory();
        }
        this.successMessage.set('Category deleted.');
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not delete category.'));
      }
    });
  }

  private loadDashboardData(): void {
    this.isLoading.set(true);
    this.clearMessages();

    forkJoin({
      users: this.userService.getAllUsers(),
      categories: this.categoryService.getAllCategories(),
      youtubers: this.youtuberProfileService.getAllProfiles(),
      companies: this.companyProfileService.getAllCompanies(),
      campaigns: this.campaignService.getAllCampaigns(),
      requests: this.cooperationRequestService.getAllRequests()
    }).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: ({ users, categories, youtubers, companies, campaigns, requests }) => {
        this.users.set(users);
        this.categories.set(categories.filter((category) => category.name?.trim()));
        this.youtubers.set(youtubers);
        this.companies.set(companies);
        this.campaigns.set(campaigns);
        this.requests.set(requests);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage.set(this.getErrorMessage(error, 'Could not load admin dashboard data.'));
      }
    });
  }

  private countRequestsByStatus(status: string): number {
    return this.requests().filter((request) => request.status === status).length;
  }

  private normalizeCategoryRequest(request: CategoryRequest): CategoryRequest {
    return {
      name: request.name.trim(),
      description: request.description.trim()
    };
  }

  private createEmptyCategoryForm(): CategoryRequest {
    return {
      name: '',
      description: ''
    };
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private getErrorMessage(error: HttpErrorResponse, fallbackMessage: string): string {
    return error.error?.message ?? fallbackMessage;
  }
}
