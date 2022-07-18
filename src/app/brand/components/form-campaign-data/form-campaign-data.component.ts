import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BrandService } from '../../services/brand.service';
import { ngxCsv } from 'ngx-csv/ngx-csv';

@Component({
  selector: 'app-form-campaign-data',
  templateUrl: './form-campaign-data.component.html',
  styleUrls: ['./form-campaign-data.component.scss']
})
export class FormCampaignDataComponent implements OnInit {

  campaignId: any;
  questionsData: any;
  data: any = [];
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

  async downloadQuestionsReport() {
    const response: any = await this.brandService.getQuestionsReportData(this.campaignId);
    if (response.success) {
      this.data = response.data;
      console.log('this.data', this.data);

      setTimeout(() => {
        new ngxCsv(this.data, 'My Report');
      }, 1000);
    }
  }

}
