import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableConfiguration } from './table-configuration';

describe('TableConfiguration', () => {
  let component: TableConfiguration;
  let fixture: ComponentFixture<TableConfiguration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableConfiguration]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableConfiguration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
