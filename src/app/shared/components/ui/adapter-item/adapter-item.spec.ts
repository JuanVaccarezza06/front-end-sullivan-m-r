import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdapterItem } from './adapter-item';

describe('AdapterItem', () => {
  let component: AdapterItem;
  let fixture: ComponentFixture<AdapterItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdapterItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdapterItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
