import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserRewardsComponent } from './user-rewards.component';

describe('UserRewardsComponent', () => {
  let component: UserRewardsComponent;
  let fixture: ComponentFixture<UserRewardsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserRewardsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserRewardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
