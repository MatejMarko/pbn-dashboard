import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { User } from './user';

describe('User', () => {
  let service: User;
  let httpTesting: HttpTestingController;

  const TIMEOUT_URL = '/bnk/poslovni/resources/v1/userApi/user/session/timeout?redirected=1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(User);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('timeout', () => {
    it('should GET the session timeout endpoint', () => {
      service.timeout().subscribe();

      const req = httpTesting.expectOne(TIMEOUT_URL);
      expect(req.request.method).toBe('GET');
      req.flush({});
    });

    it('should return the response from the server', () => {
      const mockResponse = { timeout: 300 };
      let response: any;
      service.timeout().subscribe((r) => (response = r));

      httpTesting.expectOne(TIMEOUT_URL).flush(mockResponse);
      expect(response).toEqual(mockResponse);
    });

    it('should propagate server errors', () => {
      let error: any;
      service.timeout().subscribe({ error: (e) => (error = e) });

      httpTesting.expectOne(TIMEOUT_URL).flush(null, { status: 500, statusText: 'Server Error' });
      expect(error.status).toBe(500);
    });
  });
});
