import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorageService } from '../services/token-storage.service';

const backendUrl = 'http://localhost:8080';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const tokenStorageService = inject(TokenStorageService);
  const token = tokenStorageService.getToken();

  if (!token || !request.url.startsWith(backendUrl)) {
    return next(request);
  }

  const authRequest = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(authRequest);
};
