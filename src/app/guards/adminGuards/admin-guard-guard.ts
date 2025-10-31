import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/authService/auth-service';

export const adminGuardGuard: CanActivateFn = (route, state) => {

  const service = inject(AuthService)
  const router = inject(Router)

  if (!service.hasRoleAdmin()) {
    console.log("No sos admin, no podes entrar.")
    router.navigate([''])
    return false
  }

  return true;
};
