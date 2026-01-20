import { CanActivateFn } from '@angular/router';

export const agentGuardGuard: CanActivateFn = (route, state) => {
  return true;
};
