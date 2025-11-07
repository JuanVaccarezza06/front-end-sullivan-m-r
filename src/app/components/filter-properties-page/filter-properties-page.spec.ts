import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterPropertiesPage } from './filter-properties-page';

describe('FilterPropertiesPage', () => {
  let component: FilterPropertiesPage;
  let fixture: ComponentFixture<FilterPropertiesPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterPropertiesPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterPropertiesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
