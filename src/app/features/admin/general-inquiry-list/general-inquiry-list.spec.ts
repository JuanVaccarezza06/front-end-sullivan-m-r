import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralInquiryList } from './general-inquiry-list';

describe('GeneralInquiryList', () => {
  let component: GeneralInquiryList;
  let fixture: ComponentFixture<GeneralInquiryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralInquiryList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralInquiryList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
