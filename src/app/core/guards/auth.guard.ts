import { CanActivateFn, Router } from '@angular/router';
import { Injectable, inject } from '@angular/core';

import { LoginService } from '../../auth/services/login.service';

export const authGuard: CanActivateFn = (route, state) => {
  const loginService = inject(LoginService);
  const router = inject(Router);

  // Ensure stored token is loaded (for page refresh)
  if (!loginService.isLoggedIn()) {
    // Try to load token from storage if not already loaded
    if (typeof loginService['loadStoredToken'] === 'function') {
      loginService['loadStoredToken']();
    }
    if (!loginService.isLoggedIn()) {
      return router.parseUrl('/login');
    }
  }
  // Get current user
  const currentUser = loginService.getCurrentUser();
  const currentUserId = currentUser?.id;

  // Check if the user has access to this path
  const url = state.url;
  const userRole = currentUser?.rol;

  console.log(
    `Auth guard: Checking access to ${url} for user with role "${userRole}"`
  );

  // Debugging info
  if (url.includes('/admin')) {
    console.log(
      `Admin route check: userRole="${userRole}", expected="Administrador", equal=${
        userRole === 'Administrador'
      }`
    );
  }
  // Check role-based access - handle possible string comparison issues
  if (url.includes('/admin')) {
    // Get the exact string representation for debugging
    const roleStr = String(userRole);
    const expectedRole = 'Administrador';

    console.log(
      `Role comparison: "${roleStr}" === "${expectedRole}" is ${
        roleStr === expectedRole
      }`
    );
    console.log(
      'String character codes:',
      Array.from(roleStr).map((c) => c.charCodeAt(0))
    );
    console.log(
      'Expected character codes:',
      Array.from(expectedRole).map((c) => c.charCodeAt(0))
    );

    // Check if user has admin role
    if (roleStr !== expectedRole) {
      console.warn(
        `Auth guard: User with role "${userRole}" tried to access admin route`
      );
      return router.parseUrl('/login');
    }
  }

  if (url.includes('/leader') && userRole !== 'Líder de Proyecto') {
    console.warn(
      `Auth guard: User with role ${userRole} tried to access leader route`
    );
    return router.parseUrl('/login');
  }

  if (url.includes('/employee') && userRole !== 'Empleado') {
    console.warn(
      `Auth guard: User with role ${userRole} tried to access employee route`
    );
    return router.parseUrl('/login');
  }

  if (url.includes('/client') && userRole !== 'Cliente') {
    console.warn(
      `Auth guard: User with role ${userRole} tried to access client route`
    );
    return router.parseUrl('/login');
  }

  // For routes with userId param, validate it matches logged in user
  const requestedUserId = route.params['userid'];
  if (requestedUserId && requestedUserId !== currentUserId?.toString()) {
    if (currentUserId) {
      // Redirect to the same route but with correct user ID
      return router.parseUrl(
        `/${currentUserId}${state.url.substring(state.url.indexOf('/', 1))}`
      );
    }
    return router.parseUrl('/login');
  }

  // All checks passed
  return true;
};
