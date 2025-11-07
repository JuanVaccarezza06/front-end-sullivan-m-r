import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterHome } from './filter-home';

describe('FilterHome', () => {
  let component: FilterHome;
  let fixture: ComponentFixture<FilterHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
