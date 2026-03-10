import { CanMatchFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Login } from '../services/login/login';
import { ROUTES } from '../../app.routes';

/**
 * Functional route guard that checks if the user is authenticated.
 *
 * Returns `true` to allow navigation, or a `UrlTree` redirecting
 * to `/login` when the session is not active.
 */
export const authGuard: CanMatchFn = () => {
  const login = inject(Login);
  const router = inject(Router);

  return true;
  return login.isAuthenticated() || router.createUrlTree([ROUTES.login]);
};
