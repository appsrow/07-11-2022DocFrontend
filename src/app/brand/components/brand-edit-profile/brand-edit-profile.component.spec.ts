import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandEditProfileComponent } from './brand-edit-profile.component';

describe('BrandEditProfileComponent', () => {
  let component: BrandEditProfileComponent;
  let fixture: ComponentFixture<BrandEditProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandEditProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandEditProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
