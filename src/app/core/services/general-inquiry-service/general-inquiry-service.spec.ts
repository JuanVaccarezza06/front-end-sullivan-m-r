import { TestBed } from '@angular/core/testing';

import { GeneralInquiryService } from '../general-inquiry-service';

describe('GeneralInquiryService', () => {
  let service: GeneralInquiryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneralInquiryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
