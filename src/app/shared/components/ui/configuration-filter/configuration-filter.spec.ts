import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationFilter } from './configuration-filter';

describe('ConfigurationFilter', () => {
  let component: ConfigurationFilter;
  let fixture: ComponentFixture<ConfigurationFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfigurationFilter);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
