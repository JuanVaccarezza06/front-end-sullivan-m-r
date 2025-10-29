import { TestBed } from '@angular/core/testing';

import { ImgBb } from '../imgBB/img-bb';

describe('ImgBb', () => {
  let service: ImgBb;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImgBb);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
