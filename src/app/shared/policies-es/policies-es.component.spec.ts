import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliciesEsComponent } from './policies-es.component';

describe('PoliciesEsComponent', () => {
  let component: PoliciesEsComponent;
  let fixture: ComponentFixture<PoliciesEsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PoliciesEsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PoliciesEsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
