import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { Role } from '../models/role.model';
import { TokenStorageService } from '../services/token-storage.service';

const canActivateRole = (requiredRole: Role): CanActivateFn => {
  return () => {
    const tokenStorageService = inject(TokenStorageService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
      return true;
    }

    if (!tokenStorageService.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }

    if (tokenStorageService.getRole() !== requiredRole) {
      return router.createUrlTree(['/home']);
    }

    return true;
  };
};

export const adminGuard = canActivateRole(Role.ROLE_ADMIN);
export const companyGuard = canActivateRole(Role.ROLE_COMPANY);
export const youtuberGuard = canActivateRole(Role.ROLE_YOUTUBER);
