import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-form-campaign-data',
  templateUrl: './form-campaign-data.component.html',
  styleUrls: ['./form-campaign-data.component.scss']
})
export class FormCampaignDataComponent implements OnInit {

  campaignId: any;
  questionsData: any;
  constructor(private route: ActivatedRoute,
    private brandService: BrandService,
    private router: Router) { }

  ngOnInit(): void {
    this.getAllQuestions();
  }

  async getAllQuestions() {
    await this.route.queryParams.subscribe(
      params => {
        this.campaignId = params.campaignId;
      }
    )

    const requestParams = {
      'campaign_id': this.campaignId
    }

    const response: any = await this.brandService.getCampaignQuestions(requestParams);
    if (response.success) {
      this.questionsData = response.data.questions;
    }
  }

  getQuestionAnswers(questionId: string) {
    this.router.navigate(['/brand/questionAnswers'], { queryParams: { questionId: questionId } });
  }

}
