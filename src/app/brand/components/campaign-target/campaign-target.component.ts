import { Component, Input, OnInit } from '@angular/core';
import { CampaignTargetInfo } from '../../models/campaign.model';

@Component({
  selector: 'app-campaign-target',
  templateUrl: './campaign-target.component.html',
  styleUrls: ['./campaign-target.component.scss']
})
export class CampaignTargetComponent implements OnInit {
  @Input() public createdNewlyBrandId : any;
  selectedTarget:CampaignTargetInfo;
  campaignTargetList: CampaignTargetInfo[] = [];
  

  constructor() {
    this.campaignTargetList = [
      {id: '1', name:'Lead', apiCampaignName: 'lead_target', campaignDisplayName: 'Lead' ,icon: '/assets/images/lead.png', socialLink:''},
      {id: '2', name:'uploadvideo', apiCampaignName: 'video_plays', campaignDisplayName: 'Video plays' ,icon: '/assets/images/icon_video.png', socialLink:''},
      {id: '3', name:'Follow', apiCampaignName: 'follow', campaignDisplayName: 'Follow' ,icon: '/assets/images/icon_follow.png', socialLink:'^(https://(www.)?twitter.com/).*'},
      {id: '4', name:'Appsdownload', apiCampaignName: 'apps_download', campaignDisplayName: 'Apps download' ,icon: '/assets/images/icon_download.png', socialLink:''},
      {id: '5', name:'clicksonthewebsite', apiCampaignName: 'click_websites', campaignDisplayName: 'Clicks on the website' ,icon: '/assets/images/icon_visit.png', socialLink:''},
      {id: '7', name:'questionsForm', apiCampaignName: 'questions_form', campaignDisplayName: 'Questions form' ,icon: '/assets/images/icon_visit.png', socialLink:''},
    ]
  }

  ngOnInit(): void {
  }

  getSelectedCampaignTypeName(campaignTargetInfo: CampaignTargetInfo) {
    this.selectedTarget = campaignTargetInfo;
  }

}
