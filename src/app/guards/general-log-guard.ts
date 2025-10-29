import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LogIn } from '../pages/log-in/log-in';
import { AuthService } from '../services/auth/authService/auth-service';

export const generalLogGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService)
  const router = inject(Router)  

  return authService.isLoggedIn() ? true : router.parseUrl('/login');
};
