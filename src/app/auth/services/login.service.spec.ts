import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { LoginService, LoginDto } from './login.service';

describe('LoginService', () => {
  let service: LoginService;
  let httpMock: HttpTestingController;
  let navigateSpy: jasmine.Spy;

  beforeEach(() => {
    navigateSpy = jasmine.createSpy('navigate');

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        LoginService,
        { provide: Router, useValue: { navigate: navigateSpy } },
      ],
    });

    service = TestBed.inject(LoginService);
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should login and set user state + localStorage', (done) => {
    const creds: LoginDto = {
      correoElectronico: 'admin@example.com',
      contrasena: 'secret',
    };

    const now = Math.floor(Date.now() / 1000);
    const response = {
      access_token: 'fake.jwt.token',
      tokenPayload: {
        userId: 1,
        email: 'admin@example.com',
        rol: 'Administrador',
        iat: now,
        exp: now + 3600,
      },
    };

    service.login(creds).subscribe(({ token, userId, rol }) => {
      expect(token).toBe(response.access_token);
      expect(userId).toBe(1);
      expect(rol).toBe('Administrador');

      const storedToken = localStorage.getItem('auth_token');
      const storedPayload = JSON.parse(
        localStorage.getItem('auth_token_payload') || 'null'
      );
      expect(storedToken).toBe(response.access_token);
      expect(storedPayload).toMatchObject(response.tokenPayload);

      expect(service.isLoggedIn()).toBe(true);
      const user = service.getCurrentUser();
      expect(user?.id).toBe(1);
      expect(user?.correoElectronico).toBe('admin@example.com');
      expect(user?.rol).toBe('Administrador');
      done();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(response);
  });

  it('should logout on error', (done) => {
    const creds: LoginDto = {
      correoElectronico: 'admin@example.com',
      contrasena: 'wrong',
    };

    service.login(creds).subscribe({
      next: () => done.fail('should not succeed'),
      error: () => {
        expect(service.isLoggedIn()).toBe(false);
        expect(localStorage.getItem('auth_token')).toBeNull();
        done();
      },
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: '401' });
  });
});
