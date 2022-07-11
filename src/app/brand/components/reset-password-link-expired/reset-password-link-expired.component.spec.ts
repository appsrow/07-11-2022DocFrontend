import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResetPasswordLinkExpiredComponent } from './reset-password-link-expired.component';

describe('ResetPasswordLinkExpiredComponent', () => {
  let component: ResetPasswordLinkExpiredComponent;
  let fixture: ComponentFixture<ResetPasswordLinkExpiredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResetPasswordLinkExpiredComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetPasswordLinkExpiredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
