import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormProperty } from './form-post-property';

describe('FormProperty', () => {
  let component: FormProperty;
  let fixture: ComponentFixture<FormProperty>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormProperty]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormProperty);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
