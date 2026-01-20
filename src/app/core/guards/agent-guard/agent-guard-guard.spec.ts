import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { agentGuardGuard } from './agent-guard-guard';

describe('agentGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => agentGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
