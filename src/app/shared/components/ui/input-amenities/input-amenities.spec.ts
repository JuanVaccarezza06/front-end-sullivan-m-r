import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormAmenities } from './input-amenities';

describe('FormAmenities', () => {
  let component: FormAmenities;
  let fixture: ComponentFixture<FormAmenities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormAmenities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormAmenities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
