import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { Login } from '../services/login/login';
import { ROUTES } from '../../app.routes';

/**
 * HTTP interceptor that catches 401 responses, clears the
 * authenticated flag, and redirects to the login page.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const login = inject(Login);
  const injector = inject(Injector);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401) {
        login.setAuthenticated(false);
        //void injector.get(Router).navigate([ROUTES.login]);
      }

      return throwError(() => error);
    }),
  );
};
