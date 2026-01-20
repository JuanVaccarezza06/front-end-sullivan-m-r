import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoleAssignation } from './role-assignation';

describe('RoleAssignation', () => {
  let component: RoleAssignation;
  let fixture: ComponentFixture<RoleAssignation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleAssignation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoleAssignation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
