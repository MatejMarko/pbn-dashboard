import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

export enum LoginStatus {
  INVALID = 'si.nkbm.id.login.invalid',
}

@Injectable({
  providedIn: 'root',
})
export class Login {
  private http: HttpClient = inject(HttpClient);

  private readonly _isAuthenticated = signal(false);
  public readonly isAuthenticated = this._isAuthenticated.asReadonly();

  /** Update auth state. Used by the app initializer and 401 interceptor. */
  public setAuthenticated(value: boolean): void {
    this._isAuthenticated.set(value);
  }

  public login(username: string, password: string) {
    const body = new HttpParams()
      .set('p1', username)
      .set('p2', password)
      .set('action', 'pbn-happrove')
      .set('generateChallenge', '1')
      .set('error', 'loginAgain')
      .set('platform', 'web')
      .set('version', '2.5.34-SNAPSHOT'); // API_VERSION

    return this.http.post(
      '/prijava/pbn',
      body,
      {
        headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded'),
        responseType: 'text',
      },
    );
  }
}
