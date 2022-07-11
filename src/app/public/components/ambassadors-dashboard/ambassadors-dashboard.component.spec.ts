import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AmbassadorsDashboardComponent } from './ambassadors-dashboard.component';

describe('AmbassadorsDashboardComponent', () => {
  let component: AmbassadorsDashboardComponent;
  let fixture: ComponentFixture<AmbassadorsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AmbassadorsDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AmbassadorsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
