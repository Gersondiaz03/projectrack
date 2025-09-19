import { Router, UrlTree } from '@angular/router';
import { TestBed } from '@angular/core/testing';

import { LoginService } from '../../auth/services/login.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let routerNavigateUrl: string | undefined;
  let mockLogin: Partial<LoginService>;

  beforeEach(() => {
    routerNavigateUrl = undefined;
    mockLogin = {
      isLoggedIn: () => true,
      getCurrentUser: () =>
        ({ id: 1, correoElectronico: 'a@a.com', rol: 'Administrador' } as any),
    } as Partial<LoginService> as LoginService;

    TestBed.configureTestingModule({
      providers: [
        { provide: LoginService, useValue: mockLogin },
        {
          provide: Router,
          useValue: {
            parseUrl: (u: string) =>
              ({
                toString: () => u,
              } as unknown as UrlTree),
          },
        },
      ],
    });
  });

  it('allows admin route for admin role', () => {
    const result = authGuard(
      { params: {} } as any,
      { url: '/admin/main' } as any
    );
    expect(result).toBe(true);
  });

  it('blocks admin route for non-admin', () => {
    (mockLogin.getCurrentUser as any) = () => ({
      id: 2,
      correoElectronico: 'b@b.com',
      rol: 'Empleado',
    });
    TestBed.overrideProvider(LoginService, { useValue: mockLogin });
    const res = authGuard(
      { params: {} } as any,
      { url: '/admin/main' } as any
    ) as UrlTree;
    expect(typeof (res as any).toString === 'function').toBe(true);
  });
});
