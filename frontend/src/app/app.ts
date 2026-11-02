import { Component, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Role } from './models/role.model';
import { TokenStorageService } from './services/token-storage.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
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

  constructor(
    private readonly tokenStorageService: TokenStorageService,
    private readonly router: Router
  ) {}

  logout(): void {
    this.tokenStorageService.logout();
    this.router.navigate(['/home']);
  }
}
