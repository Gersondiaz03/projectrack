import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { LoginService } from '../../auth/services/login.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: HTTP_INTERCEPTORS, useValue: authInterceptor, multi: true },
        {
          provide: LoginService,
          useValue: {
            getToken: () => 'abc',
            logout: () => {},
          },
        },
        { provide: Router, useValue: { navigate: () => {} } },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should not add header for /auth/login', () => {
    http.post('/auth/login', { a: 1 }).subscribe();
    const req = httpMock.expectOne('/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ ok: true });
  });

  it('should add Authorization for other calls', () => {
    http.get('/users').subscribe();
    const req = httpMock.expectOne('/users');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush([]);
  });
});
