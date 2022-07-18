import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { CampaignTargetInfo } from '../../models/campaign.model';
import { BrandService } from '../../services/brand.service';

@Component({
  selector: 'app-questions-form',
  templateUrl: './questions-form.component.html',
  styleUrls: ['./questions-form.component.scss']
})
export class QuestionsFormComponent implements OnInit {

  dropdownSettings = {};
  questionTypes: any;
  submitted: boolean = false;
  rows: FormArray;
  optionRows: FormArray;
  questionsForm: FormGroup;
  showOptions: boolean = false;
  eventRowId: number;
  indexRow: number;
  optionsForm: FormGroup;
  questionsPerForm: number = 10;


  campaignInformation: any;
  @Input() selectedTarget: CampaignTargetInfo = { id: '', name: '', apiCampaignName: '', campaignDisplayName: '', icon: '', socialLink: '' };
  @Input() IsfromPrevious: boolean;
  @Input() campaignInfo: any;
  //@Input() questionsFormData: any;


  constructor(private formBuilder: FormBuilder,
    public utilityService: UtilityService,
    private brandService: BrandService) {

    this.questionsForm = this.formBuilder.group({
      formName: ['', Validators.required],
      formDescription: ['', Validators.required],
      questionType: [''],
      questionText: [''],
    });

    console.log('this.IsfromPrevious', this.IsfromPrevious);


    this.rows = this.formBuilder.array([]);
    // this.optionRows = this.formBuilder.array([]);
    // console.log('this.rows', this.rows);
    if (!this.IsfromPrevious) { this.questionsForm.addControl('rows', this.rows); }
    // this.optionsForm.addControl('optionRows', this.optionRows);
  }

  async ngOnInit() {
    console.log('this.IsfromPrevious', this.IsfromPrevious);
    this.dropdownSettings = {
      singleSelection: true,
      //text:"Select Countries",
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: "myclass custom-class",
    };

    // console.log('questionsForm', this.questionsForm);
    await this.getQuestionTypes();
    console.log(this.rows.length);

    if (!this.IsfromPrevious && this.rows.length < 1)
      this.rows.push(this.createItemFormGroup());
    // console.log('campaignInformation', this.campaignInfo);
  }

  get userFormGroups() {
    return this.questionsForm.get('rows') as FormArray;
  }

  get questionsOptions() {
    return this.optionsForm.get('optionRows') as FormArray;
  }

  onItemSelect(item: any) {
    console.log('item', item);
  }

  OnItemDeSelect(item: any) {
  }

  onSelectAll(items: any) { }

  onDeSelectAll(items: any) { }

  async getQuestionTypes() {
    this.utilityService.showLoading();
    try {
      const response: any = await this.brandService.getQuestionTypes();
      if (response.success) {
        // console.log('respo', response);


        this.questionTypes = response.data.map((item: any) => {
          return { id: item.id, itemName: item.name };
        });
        // console.log("this.questionTypes", this.questionTypes)

      }
      this.utilityService.hideLoading();
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedGetCountryList');
      this.utilityService.hideLoading();
    }
  }

  addformQuestions() {
    if (this.rows.length < this.questionsPerForm) {
      this.rows.push(this.createItemFormGroup());
    } else {
      this.utilityService.showInfoToast('toast.tenQuestionsPerForm');
    }

  }

  async FormFill(row: any) {
    return await this.rows.push(

      this.formBuilder.group({
        questionType: [row.questionType, Validators.required],
        questionText: [row.questionText, Validators.required],
        option1: [row.option1, Validators.required],
        option2: [row.option2, Validators.required],
        option3: [row.option3],
        option4: [row.option4]
      })


    )
  }

  createItemFormGroup(): FormGroup {
    return this.formBuilder.group({
      questionType: ['', Validators.required],
      questionText: ['', Validators.required],
      option1: ['', Validators.required],
      option2: ['', Validators.required],
      option3: [''],
      option4: ['']
    });
  }


  onRemoveRow(rowIndex: number) {
    this.rows.removeAt(rowIndex);
  }

  formcontrol(row: any, columnname: string) {
    return row.get(columnname);
  }

  IsOptionShow(row: any, index: number) {
    if (row.controls.questionType.value != null || row.controls.questionType.value != undefined) {
      if (row.controls.questionType?.value[0]?.id == 1) { return true }
      return false;
    }
    return false;
  }
}
