import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormZone } from './form-zone';

describe('FormZone', () => {
  let component: FormZone;
  let fixture: ComponentFixture<FormZone>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormZone]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormZone);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
