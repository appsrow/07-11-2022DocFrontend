import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandMyWalletComponent } from './brand-my-wallet.component';

describe('BrandMyWalletComponent', () => {
  let component: BrandMyWalletComponent;
  let fixture: ComponentFixture<BrandMyWalletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandMyWalletComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BrandMyWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
