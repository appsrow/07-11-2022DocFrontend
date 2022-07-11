import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CampaignCreateTabsComponent } from './campaign-create-tabs.component';

describe('CampaignCreateTabsComponent', () => {
  let component: CampaignCreateTabsComponent;
  let fixture: ComponentFixture<CampaignCreateTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CampaignCreateTabsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CampaignCreateTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
