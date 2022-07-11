import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailExipredComponent } from './email-exipred.component';

describe('EmailExipredComponent', () => {
  let component: EmailExipredComponent;
  let fixture: ComponentFixture<EmailExipredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmailExipredComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailExipredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
