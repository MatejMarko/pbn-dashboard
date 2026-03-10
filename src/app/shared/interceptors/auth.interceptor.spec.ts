import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, Router } from '@angular/router';

import { authInterceptor } from './auth.interceptor';
import { Login } from '../services/login/login';
import { ROUTES } from '../../app.routes';

describe('authInterceptor', () => {
  let httpTesting: HttpTestingController;
  let http: HttpClient;
  let login: Login;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    login = TestBed.inject(Login);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should pass through successful responses', () => {
    let response: any;
    http.get('/api/data').subscribe((r) => (response = r));

    httpTesting.expectOne('/api/data').flush({ ok: true });
    expect(response).toEqual({ ok: true });
  });

  it('should set authenticated to false on 401', () => {
    login.setAuthenticated(true);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get('/api/data').subscribe({ error: () => {} });
    httpTesting.expectOne('/api/data').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(login.isAuthenticated()).toBe(false);
  });

  it('should navigate to login on 401', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get('/api/data').subscribe({ error: () => {} });
    httpTesting.expectOne('/api/data').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(navigateSpy).toHaveBeenCalledWith([ROUTES.login]);
  });

  it('should re-throw the error on 401', () => {
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    let error: any;

    http.get('/api/data').subscribe({ error: (e) => (error = e) });
    httpTesting.expectOne('/api/data').flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(error.status).toBe(401);
  });

  it('should not navigate on non-401 errors', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    http.get('/api/data').subscribe({ error: () => {} });
    httpTesting.expectOne('/api/data').flush(null, { status: 500, statusText: 'Server Error' });

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should not change authenticated state on non-401 errors', () => {
    login.setAuthenticated(true);

    http.get('/api/data').subscribe({ error: () => {} });
    httpTesting.expectOne('/api/data').flush(null, { status: 500, statusText: 'Server Error' });

    expect(login.isAuthenticated()).toBe(true);
  });
});
