import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Consults } from './consults';

describe('Consults', () => {
  let component: Consults;
  let fixture: ComponentFixture<Consults>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Consults]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Consults);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
