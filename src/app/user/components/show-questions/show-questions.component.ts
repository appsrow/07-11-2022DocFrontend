import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/shared/services/auth.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { CompleteTaskData, CompleteTaskRequestParameters } from '../../models/user-task.model';
import { UserService } from '../../services/user.service';
declare const gtag: Function;

@Component({
  selector: 'app-show-questions',
  templateUrl: './show-questions.component.html',
  styleUrls: ['./show-questions.component.scss']
})
export class ShowQuestionsComponent implements OnInit {

  questionsFormData: any;
  userAnswerForm: FormGroup = new FormGroup({});
  questionsAnswers = [];
  campaignId: string = '';
  submitted: boolean = false;
  campaignFormId: number;
  constructor(public utilityService: UtilityService,
    public userService: UserService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService) { }

  async ngOnInit() {
    await this.route.params.subscribe(params => {
      this.campaignId = params['campaignId'];
    }
    )
    this.userAnswerForm = this.formBuilder.group({});
    await this.getQuestions();
  }

  async getQuestions() {
    try {
      this.utilityService.showLoading();
      const requestBody: any = {
        'campaign_id': this.campaignId
      }

      const response: any = await this.userService.showCampaignQuestions(requestBody);

      if (response) {
        this.utilityService.hideLoading();
        console.log('response', response);
        this.questionsFormData = response.data;
        this.campaignFormId = response.data.id;
        response.data.questions.forEach((data: any) => {
          this.userAnswerForm.addControl('questions' + data.id + '', new FormControl('', Validators.required));
        });
      }


    }
    catch (error) {
      this.utilityService.hideLoading();
    }
  }

  async submitQuestions() {
    this.submitted = true;
    if (!this.userAnswerForm.valid) {
      console.log('this.userAnswerForm', this.userAnswerForm);

      return;
    }
    try {
      this.utilityService.showLoading();
      const mapped = Object.keys(this.userAnswerForm.value).map(key => ({ question_id: key.replace("questions", ""), answer: this.userAnswerForm.value[key] }));

      const requestParams = {
        'camapign_form_id': this.campaignFormId,
        'campaign_id': this.campaignId,
        'question_data': mapped
      }
      const response: any = await this.userService.submitCampaignAnswers(requestParams);

      if (response.success) {
        this.utilityService.hideLoading();
        this.questionsFormData = response.data;
        this.completeFormsTask();
      } else {
        this.utilityService.hideLoading();
        this.utilityService.showErrorToast(response.message);
      }
    }
    catch (error) {
      this.utilityService.hideLoading();
    }
  }

  async completeFormsTask() {
    const updateData: CompleteTaskRequestParameters = {
      user_id: this.authService.getLoggedInUserDetail().user_info.id,
      campaign_id: this.campaignId.toString(),
      campaign_type: 'questions_form'
    };

    this.utilityService.showLoading();
    try {
      const response: CompleteTaskData = await this.userService.completeTask(updateData);
      if (response.success) {
        this.utilityService.hideLoading();
        this.utilityService.showSuccessToast('toast.congratulationsCoinsAddedInWallet');
        if (response.data.coins) {
          gtag("event", "earn_virtual_currency", {
            virtual_currency_name: "coins",
            value: response.data.coins
          });
        }
        this.router.navigate(['/user/userTasks']);
      }
      else {
        this.utilityService.showErrorToast(response.message);
        this.utilityService.hideLoading();
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedCompleteTask');
      this.utilityService.hideLoading();
    }
  }

}
