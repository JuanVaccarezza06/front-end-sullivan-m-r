import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormUpdateProperty } from './form-update-property';

describe('FormUpdateProperty', () => {
  let component: FormUpdateProperty;
  let fixture: ComponentFixture<FormUpdateProperty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormUpdateProperty]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormUpdateProperty);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
