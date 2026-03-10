import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class User {
  private http: HttpClient = inject(HttpClient);

  /** Pure HTTP call — callers decide how to interpret the result. */
  public timeout(): Observable<any> {
    return this.http.get(
      '/bnk/poslovni/resources/v1/userApi/user/session/timeout?redirected=1');
  }
}
