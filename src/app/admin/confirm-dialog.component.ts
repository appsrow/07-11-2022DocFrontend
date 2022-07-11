import {
    ChangeDetectionStrategy,
    Component
  } from '@angular/core';
  import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
  
  @Component({
    selector: 'app-confirm-dialog',
    template: `
  <div class="confirm-model">
    <div class="modal-header d-flex justify-content-between">
      <h4 class="modal-title">{{ 'admin.confirm' | translate }}</h4>
      <button type="button" class="close without_head" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
      <span aria-hidden="true">×</span>
      </button>
    </div>
    <div class="modal-body">
      <p>{{prompt}}</p>
    </div>
    <div class="modal-footer">
    <button type="button" class=" btn-outline" (click)="activeModal.close(false)">{{ 'admin.cancel' | translate }}</button>
      <button type="button" class="btn btn-green" (click)="activeModal.close(true)">OK</button>
      
    </div>
  </div>`,
  
    changeDetection: ChangeDetectionStrategy.OnPush
  })
  export class ConfirmDialogComponent {
    title!: string;
    prompt!: string;
  
    constructor(public activeModal: NgbActiveModal) {
    }
  }
  