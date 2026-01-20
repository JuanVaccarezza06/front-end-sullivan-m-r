import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormOwner } from './form-owner';

describe('FormOwner', () => {
  let component: FormOwner;
  let fixture: ComponentFixture<FormOwner>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormOwner]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormOwner);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
