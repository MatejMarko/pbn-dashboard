import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { provideRouter } from '@angular/router';

import { authGuard } from './auth.guard';
import { Login } from '../services/login/login';
import { ROUTES } from '../../app.routes';

describe('authGuard', () => {
  let login: Login;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideRouter([])],
    });
    login = TestBed.inject(Login);
    router = TestBed.inject(Router);
  });

  function runGuard() {
    return TestBed.runInInjectionContext(() => authGuard({} as any, [] as any)) as boolean | UrlTree;
  }

  it('should return true when authenticated', () => {
    login.setAuthenticated(true);
    expect(runGuard()).toBe(true);
  });

  it('should return a UrlTree to /login when not authenticated', () => {
    login.setAuthenticated(false);

    const result = runGuard();
    const expected = router.createUrlTree([ROUTES.login]);

    expect(result).toBeInstanceOf(UrlTree);
    expect(result.toString()).toBe(expected.toString());
  });
});
