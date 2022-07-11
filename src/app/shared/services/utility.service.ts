import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject } from 'rxjs';

declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  private subject = new Subject<any>();

  sendClickEvent() {
    this.subject.next();
  }

  getClickEvent(): Observable<any> {
    return this.subject.asObservable();
  }

  constructor(private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private toastr: ToastrService) { }

  onlyNumber(e: any): boolean {
    return (!(e.charCode < 48 || e.charCode > 57));
  }

  onlyNumberAndDecimal(e: any): boolean {
    return (!(e.charCode != 46 && e.charCode > 31
      && (e.charCode < 48 || e.charCode > 57)))
  }

  onlyNumberAndDecimalAllow2Points(evt: any) {
    var keyCode = evt.keyCode ? evt.keyCode : ((evt.charCode) ? evt.charCode : evt.which);
    //    8   Backspace
    //    9   Tab key 
    //    46  Delete
    //    35  End Key
    //    36  Home Key
    //    37  Left arrow Move
    //    39  Right arrow Move
    if (!(keyCode >= 48 && keyCode <= 57)) {
      if (!(keyCode == 8 || keyCode == 9 || keyCode == 35 || keyCode == 36 || keyCode == 37 || keyCode == 39 || keyCode == 46)) {
        return false;
      }
      else {
        return true;
      }
    }

    var velement = evt.target || evt.srcElement
    var fstpart_val = velement.value;
    var fstpart = velement.value.length;
    if (fstpart.length == 2) return false;
    var parts = velement.value.split('.');
    if (parts[0].length >= 14) return false;
    if (parts.length == 2 && parts[1].length >= 2) return false;
  }

  phoneNumberValidation(e: any): any {

    const pattern = /[0-9\+\-\(\)\ ]/;

    let inputChar = String.fromCharCode(e.charCode);
    if (e.keyCode != 8 && !pattern.test(inputChar)) {
      e.preventDefault();
    }
    // return (!(e.charCode != 46 && e.charCode != 40 && e.charCode != 41 && e.charCode != 43 && e.charCode != 45 && e.charCode > 31 
    //   && (e.charCode < 48 || e.charCode > 57))) 
  }

  onlyAlpha(e: any): boolean {
    return (!(e.charCode < 65 || e.charCode > 122) || e.charCode === 255 || e.charCode === 233 || e.charCode === 237 || e.charCode === 243 || e.charCode === 250);
  }

  onlyAlphAndSpace(e: any): boolean {
    return (!(e.charCode < 65 || e.charCode > 122) || e.charCode === 32 || e.charCode === 255 || e.charCode === 233 || e.charCode === 237 || e.charCode === 243 || e.charCode === 250);
  }


  public isNumeric(value: any): boolean {
    return $.isNumeric(value);
  }

  public static MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && !matchingControl.errors.mustMatch) {
        // return if another validator has already found an error on the matchingControl
        return;
      }

      // set error on matchingControl if validation fails
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
      } else {
        matchingControl.setErrors(null);
      }
    }

  }

  showLoading() {
    this.spinner.show(undefined, {
      type: 'ball-clip-rotate-multiple'
    });
  }

  hideLoading() {
    if (this.spinner) {
      this.spinner.hide();
    }
  }

  showSuccessToast(message: string) {
    this.translate.get(message).subscribe((data: any) => {
      this.toastr.success(data);
    });
  }

  showErrorToast(message: string) {
    this.translate.get(message).subscribe((data: any) => {
      this.toastr.error(data);
    });
  }

  showInfoToast(message: string) {
    this.translate.get(message).subscribe((data: any) => {
      this.toastr.info(data);
    });
  }

  nFormatter(num: number, digits: number) {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "k" },
      { value: 1e6, symbol: "M" },
      { value: 1e9, symbol: "G" },
      { value: 1e12, symbol: "T" },
      { value: 1e15, symbol: "P" },
      { value: 1e18, symbol: "E" }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup.slice().reverse().find(function (item) {
      return num >= item.value;
    });
    return item ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol : "0";
  }

  parseFloatNumber(num: number) {
    return Number(num);
  }
}