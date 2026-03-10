import { Component, inject } from '@angular/core';
import { DsButton, DsError, DsFormField, DsInput, DsLabel } from '@design-system';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '../shared/services/user/user';
import { Login as LoginService, LoginStatus } from '../shared/services/login/login';
import { catchError, EMPTY, filter, of, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ROUTES } from '../app.routes';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    DsButton,
    DsError,
    DsFormField,
    DsInput,
    DsLabel,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  protected router = inject(Router);
  protected userService = inject(User);
  protected loginService = inject(LoginService);
  protected loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  protected login(): void {
    const { username, password } = this.loginForm.value;
    this.loginService.login(username!, password!)
      .pipe(
        switchMap((response: string) => {
          response = response.trim().replaceAll('\n', '');

          if (!response) {
            return of(true);
          }
          else if (response === LoginStatus.INVALID) {
            this.loginForm.controls.username.setErrors({ invalidCredentials: true });
            this.loginForm.controls.password.setErrors({ invalidCredentials: true });
          }
          return of(false);
        }),
        filter(Boolean),
        switchMap(() => this.userService.timeout()),
        tap(() => this.router.navigate([ROUTES.dashboard])),
        catchError((error) => {
          // handle error
          return EMPTY;
        }),
      )
      .subscribe();
  }

}
