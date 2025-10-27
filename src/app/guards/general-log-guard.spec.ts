import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { generalLogGuard } from './general-log-guard';

describe('generalLogGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => generalLogGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
