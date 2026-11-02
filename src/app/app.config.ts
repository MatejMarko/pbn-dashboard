import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { catchError, EMPTY, of, tap } from 'rxjs';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors, withXhr } from '@angular/common/http';
import { User } from './shared/services/user/user';
import { Login } from './shared/services/login/login';
import { authInterceptor } from './shared/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withXhr(), withInterceptors([authInterceptor])),
    provideAppInitializer(() => {
      const user = inject(User);
      const login = inject(Login);

      return of(true);
      return user.timeout().pipe(
        tap(() => login.setAuthenticated(true)),
        catchError(() => EMPTY),
      );
    }),
  ]
};
