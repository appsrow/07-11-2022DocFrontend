import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormCampaignDataComponent } from './form-campaign-data.component';

describe('FormCampaignDataComponent', () => {
  let component: FormCampaignDataComponent;
  let fixture: ComponentFixture<FormCampaignDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormCampaignDataComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormCampaignDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
