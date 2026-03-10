import { Routes } from '@angular/router';
import { authGuard } from './shared/guards/auth.guard';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';

export const ROUTES = {
  login: 'login',
  dashboard: '',
} as const;

export const routes: Routes = [
  { path: ROUTES.login, component: Login },
  { path: ROUTES.dashboard, component: Dashboard, canMatch: [authGuard], children: [] },
];
