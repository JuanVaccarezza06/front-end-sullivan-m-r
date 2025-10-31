import { TestBed } from '@angular/core/testing';

import { ImgBbService } from './img-bb-service';

describe('ImgBb', () => {
  let service: ImgBbService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImgBbService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
