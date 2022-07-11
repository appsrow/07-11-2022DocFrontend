import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal, NgbModalConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';
import { LoginService } from 'src/app/shared/services/login.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { Rewards, RewardsRequestParameters, Task, TaskDetail, TaskParameters } from '../../models/user-task.model';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-completed-tasks',
  templateUrl: './user-completed-tasks.component.html',
  styleUrls: ['./user-completed-tasks.component.scss']
})
export class UserCompletedTasksComponent implements OnInit {

  modalContent: TaskDetail;
  closeModal!: string;
  allTasks: TaskDetail[] = [];
  leadTasks: TaskDetail[] = [];
  downloadTasks: TaskDetail[] = [];
  followTasks: TaskDetail[] = [];
  videoTasks: TaskDetail[] = [];
  visitTasks: TaskDetail[] = [];
  modalReference!: NgbModalRef;
  twitchSubscription: number = 0;
  paypal: number = 0;
  result = '';
  url: string = '';
  FBUrl!: SafeResourceUrl;

  constructor(
    config: NgbModalConfig,
    private userService: UserService,
    public loginService: LoginService,
    private router: Router,
    private modalService: NgbModal,
    private toastr: ToastrService,
    private authService: AuthService,
    private utilityService: UtilityService,
    public sanitizer: DomSanitizer
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit() {
    this.getTasksList();
    this.getRewards();
  }

  async getTasksList() {
    try {
      this.utilityService.showLoading();
      const updateData: TaskParameters = {
        user_id: this.authService.getLoggedInUserDetail().user_info.id,
      }
      const response: Task = await this.userService.getAllCompletedTask(updateData);
      if (response.success) {
        this.utilityService.hideLoading();
        this.allTasks = response.data;
        this.leadTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'lead_target');
        this.downloadTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'apps_download');
        this.followTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'follow');
        this.videoTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'video_plays');
        this.visitTasks = this.allTasks.filter((x: { campaign_type: string; }) => x.campaign_type === 'click_websites');

      } else {
        this.utilityService.hideLoading();
      }
    } catch (error) {

      this.utilityService.hideLoading();
      this.utilityService.showErrorToast('toast.failedToFetchTaskList');
    }
  }

  async getRewards() {
    const updateData: RewardsRequestParameters = {
      user_id: this.authService.getLoggedInUserDetail().user_info.id
    }
    try {
      this.utilityService.showLoading();
      const response: Rewards = await this.userService.getRewards(updateData);
      if (response.success) {
        this.utilityService.hideLoading();
        this.twitchSubscription = response.data.rewards[0].percentage;
        this.paypal = response.data.rewards[1].percentage;
      } else {
        this.utilityService.hideLoading();
      }
    } catch (error) {
      this.utilityService.hideLoading();
    }
  }

  triggerModal(content: any, task: TaskDetail) {
    this.modalContent = task;
    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' })
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
  }

  async triggerVideoModal(content: any, task: TaskDetail) {
    this.modalReference.close();
    this.modalContent = task;
    this.modalReference = await this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' })
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
  }



  triggerModalFollow(content: any, task: any) {
    this.modalContent = task;
    this.url = "https://www.facebook.com/plugins/like.php?href=" + this.modalContent.selected_social_media_url + "&layout=button&action=like&size=large&share=false&appId=550737849385414"
    this.FBUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    this.modalReference = this.modalService.open(content, { centered: true, backdropClass: 'light-blue-backdrop', size: 'md' })
    this.modalReference.result.then((res) => {
      this.closeModal = `Closed with: ${res}`;
    },
      (res) => {
        this.closeModal = `Dismissed ${this.getDismissReason(res)}`;
      });
  }



  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  goToTasks() {
    this.router.navigate(['user/userTasks']);
  }


}