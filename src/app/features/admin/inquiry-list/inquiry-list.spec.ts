import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InquiryList } from './inquiry-list';

describe('InquiryList', () => {
  let component: InquiryList;
  let fixture: ComponentFixture<InquiryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InquiryList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InquiryList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
