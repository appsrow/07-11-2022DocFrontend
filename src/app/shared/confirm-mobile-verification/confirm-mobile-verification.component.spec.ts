import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmMobileVerificationComponent } from './confirm-mobile-verification.component';

describe('ConfirmMobileVerificationComponent', () => {
  let component: ConfirmMobileVerificationComponent;
  let fixture: ComponentFixture<ConfirmMobileVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmMobileVerificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmMobileVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
