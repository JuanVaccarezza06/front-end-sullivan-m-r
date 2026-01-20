import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadPropertyImages } from './input-images';

describe('LoadPropertyImages', () => {
  let component: LoadPropertyImages;
  let fixture: ComponentFixture<LoadPropertyImages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadPropertyImages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoadPropertyImages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
