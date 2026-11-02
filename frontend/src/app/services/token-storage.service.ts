import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { AuthResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly tokenKey = 'adconnect_token';
  private readonly userKey = 'adconnect_user';
  private readonly isBrowser: boolean;
  private readonly token = signal<string | null>(null);
  private readonly user = signal<AuthResponse | null>(null);

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      this.token.set(localStorage.getItem(this.tokenKey));
      this.user.set(this.readUserFromStorage());
    }
  }

  saveToken(token: string): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.tokenKey, token);
    this.token.set(token);
  }

  getToken(): string | null {
    if (!this.isBrowser) {
      return null;
    }

    const token = localStorage.getItem(this.tokenKey);
    this.token.set(token);
    return token;
  }

  saveUser(user: AuthResponse): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.user.set(user);
  }

  getUser(): AuthResponse | null {
    if (!this.isBrowser) {
      return null;
    }

    const user = this.readUserFromStorage();
    this.user.set(user);
    return user;
  }

  getRole(): string | null {
    return this.getUser()?.role ?? null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null && this.getUser() !== null;
  }

  logout(): void {
    if (!this.isBrowser) {
      return;
    }

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.token.set(null);
    this.user.set(null);
  }

  loggedInSignal(): boolean {
    return this.token() !== null && this.user() !== null;
  }

  roleSignal(): string | null {
    return this.user()?.role ?? null;
  }

  private readUserFromStorage(): AuthResponse | null {
    const user = localStorage.getItem(this.userKey);

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as AuthResponse;
    } catch {
      return null;
    }
  }
}
