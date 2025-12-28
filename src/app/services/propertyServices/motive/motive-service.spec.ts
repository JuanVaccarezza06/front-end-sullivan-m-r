import { TestBed } from '@angular/core/testing';

import { MotiveService } from './motive-service';

describe('MotiveService', () => {
  let service: MotiveService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MotiveService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
