import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadUserslistComponent } from './lead-userslist.component';

describe('LeadUserslistComponent', () => {
  let component: LeadUserslistComponent;
  let fixture: ComponentFixture<LeadUserslistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeadUserslistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadUserslistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
