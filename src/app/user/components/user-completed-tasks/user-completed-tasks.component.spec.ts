import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserCompletedTasksComponent } from './user-completed-tasks.component';

describe('UserCompletedTasksComponent', () => {
  let component: UserCompletedTasksComponent;
  let fixture: ComponentFixture<UserCompletedTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserCompletedTasksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserCompletedTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
