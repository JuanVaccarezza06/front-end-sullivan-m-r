import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutenticationForm } from './autentication-form';

describe('AutenticationForm', () => {
  let component: AutenticationForm;
  let fixture: ComponentFixture<AutenticationForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AutenticationForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AutenticationForm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
