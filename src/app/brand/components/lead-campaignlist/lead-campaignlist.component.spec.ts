import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadCampaignlistComponent } from './lead-campaignlist.component';

describe('LeadCampaignlistComponent', () => {
  let component: LeadCampaignlistComponent;
  let fixture: ComponentFixture<LeadCampaignlistComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeadCampaignlistComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LeadCampaignlistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
