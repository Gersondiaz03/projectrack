import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  tap,
  throwError,
} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { User, UserState, TokenPayload } from '../../core/model/user.model';
import { environment } from '../../../environments/environment';

export interface LoginDto {
  correoElectronico: string;
  contrasena: string;
}

export interface LoginResponse {
  access_token: string;
  tokenPayload: TokenPayload;
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly apiUrl = `${environment.apiUrl}/auth/login`;
  private readonly TOKEN_KEY = 'auth_token';
  private userStateSubject = new BehaviorSubject<UserState>({
    isLoggedIn: false,
    user: null,
    token: null,
  });

  public userState$ = this.userStateSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredToken();
  }
  login(
    credentials: LoginDto
  ): Observable<{ token: string; userId: number | null; rol: string }> {
    console.log(
      '[AuthService] Attempting login for:',
      credentials.correoElectronico
    );
    return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
      map((response) => {
        const token = response.access_token;
        const payload = response.tokenPayload;

        if (!payload || !payload.userId || !payload.email || !payload.rol) {
          console.error('Invalid token payload structure received:', payload);
          this.logout();
          throw new Error(
            'Invalid token payload received from server. Please contact support.'
          );
        }

        // Set up auto-logout timer based on exp
        if (payload.exp) {
          const msUntilExp = payload.exp * 1000 - Date.now();
          if (msUntilExp > 0) {
            setTimeout(() => {
              this.logout();
            }, msUntilExp);
          } else {
            this.logout();
            throw new Error('Session expired. Please log in again.');
          }
        } // Log the role type for debugging

        // Store iat and exp in userState for session management
        const userState = {
          isLoggedIn: true,
          user: {
            id: payload.userId,
            correoElectronico: payload.email,
            rol: payload.rol,
          },
          token: token,
          // @ts-ignore
          iat: payload.iat,
          exp: payload.exp,
        };

        console.log(
          '[AuthService] Setting user state:',
          JSON.stringify(userState, null, 2)
        );
        this.userStateSubject.next(userState);

        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(
          this.TOKEN_KEY + '_payload',
          JSON.stringify(payload)
        );

        return { token, userId: payload.userId, rol: payload.rol };
      }),
      catchError((error) => {
        console.error('Login error:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.TOKEN_KEY + '_payload');
    this.userStateSubject.next({
      isLoggedIn: false,
      user: null,
      token: null,
    });
    this.router.navigate(['/login']);
  }
  private loadStoredToken(): void {
    const token = localStorage.getItem(this.TOKEN_KEY);
    const payloadStr = localStorage.getItem(this.TOKEN_KEY + '_payload');
    if (token && payloadStr) {
      try {
        const payload = JSON.parse(payloadStr);
        // Check expiration
        const now = Date.now() / 1000;
        if (!payload.exp || payload.exp < now) {
          this.logout();
          return;
        }

        // Verify we have all required user data
        if (!payload.userId || !payload.email || !payload.rol) {
          console.error('Incomplete token payload:', payload);
          this.logout();
          return;
        }

        // Set up auto-logout timer
        const msUntilExp = payload.exp * 1000 - Date.now();
        if (msUntilExp > 0) {
          setTimeout(() => {
            this.logout();
          }, msUntilExp);
        } else {
          this.logout();
          return;
        }

        // Create user state object
        const userState = {
          isLoggedIn: true,
          user: {
            id: payload.userId,
            correoElectronico: payload.email,
            rol: payload.rol,
          },
          token: token,
          // @ts-ignore
          iat: payload.iat,
          exp: payload.exp,
        };

        console.log(
          'Setting user state from storage:',
          JSON.stringify(userState, null, 2)
        );
        this.userStateSubject.next(userState);
      } catch (e) {
        console.error('Error parsing stored token payload:', e);
        this.logout();
      }
    } else {
      this.logout();
    }
  }

  getToken(): string | null {
    return this.userStateSubject.value.token;
  }

  isLoggedIn(): boolean {
    return this.userStateSubject.value.isLoggedIn;
  }

  getCurrentUser(): User | null {
    return this.userStateSubject.value.user;
  }

  getCurrentUserId(): number | null {
    return this.userStateSubject.value.user?.id || null;
  }

  // Optionally, add getters for iat and exp if needed
  getTokenIssuedAt(): number | null {
    // @ts-ignore
    return this.userStateSubject.value.iat || null;
  }

  getTokenExpiration(): number | null {
    // @ts-ignore
    return this.userStateSubject.value.exp || null;
  }
}
