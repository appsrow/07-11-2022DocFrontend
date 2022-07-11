import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamerSubscriptionsComponent } from './streamer-subscriptions.component';

describe('StreamerSubscriptionsComponent', () => {
  let component: StreamerSubscriptionsComponent;
  let fixture: ComponentFixture<StreamerSubscriptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StreamerSubscriptionsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StreamerSubscriptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
