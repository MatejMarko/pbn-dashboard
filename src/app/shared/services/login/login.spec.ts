import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { Login, LoginStatus } from './login';

describe('Login', () => {
  let service: Login;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(Login);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isAuthenticated', () => {
    it('should default to false', () => {
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should return true after setAuthenticated(true)', () => {
      service.setAuthenticated(true);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false after setAuthenticated(false)', () => {
      service.setAuthenticated(true);
      service.setAuthenticated(false);
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('login', () => {
    it('should POST to /prijava/pbn with form-urlencoded body', () => {
      service.login('user', 'pass').subscribe();

      const req = httpTesting.expectOne('/prijava/pbn');
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
      expect(req.request.responseType).toBe('text');

      const body = req.request.body.toString();
      expect(body).toContain('p1=user');
      expect(body).toContain('p2=pass');
      expect(body).toContain('action=pbn-happrove');

      req.flush('');
    });
  });
});
