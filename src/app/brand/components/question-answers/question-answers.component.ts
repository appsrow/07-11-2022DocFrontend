import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-question-answers',
  templateUrl: './question-answers.component.html',
  styleUrls: ['./question-answers.component.scss']
})
export class QuestionAnswersComponent implements OnInit {

  questionId: number;
  answersData: any;
  questionText: string;
  constructor(private route: ActivatedRoute,
    private brandService: BrandService,
    private router: Router) { }

  async ngOnInit() {
    await this.route.queryParams.subscribe(
      params => {
        this.questionId = params.questionId;
        console.log('questionId', this.questionId);
      }
    )
    this.getQuestionAnswers();
  }

  async getQuestionAnswers() {
    const requestParams = {
      'question_id': this.questionId
    }

    const response: any = await this.brandService.getQuestionAnswers(requestParams);
    if (response.success) {
      this.questionText = response.data.question_test;
      this.answersData = response.data.form_answers;
      console.log('answersData', this.answersData);

    }
  }

  goToCampaigns() {
    this.router.navigate(['brand/myCampaign']);
  }


}
