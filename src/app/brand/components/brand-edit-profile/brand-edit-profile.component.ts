import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxImageCompressService } from 'ngx-image-compress';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/services/auth.service';
import { HeaderService } from 'src/app/shared/services/header.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { BrandProfileData, UpdateBrandProfileRequestParameters } from '../../models/profile.model';
import { BrandService } from '../../services/brand.service';


@Component({
  selector: 'app-brand-edit-profile',
  templateUrl: './brand-edit-profile.component.html',
  styleUrls: ['./brand-edit-profile.component.scss']
})
export class BrandEditProfileComponent implements OnInit {

  myProfileForm: FormGroup;
  submitted: boolean = false;
  error: string = '';
  imageError:string = '';
  image: string = '';

  constructor(
    private brandService: BrandService,
    private formbuilder: FormBuilder,
    public utilityService: UtilityService,
    private authService: AuthService,
    private toastr: ToastrService,
    private router: Router,
    private headerService: HeaderService
  ) {
      this.myProfileForm = this.formbuilder.group({
        companyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
        companyMobile: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]],
        companyEmail: ['', [Validators.required, Validators.pattern(/^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/)]],
        photo: ['']
      })
    }

    customValidator(control: FormControl) {
      let inputValue = control.value;
      if (inputValue) {
        return null;
      } else {
        return {
          invalid: true
        }
      }
    }
  ngOnInit(): void {
    this.getBrandProfile();
  }

  async getBrandProfile() {
    this.utilityService.showLoading();
    try {
      const response: BrandProfileData = await this.brandService.getBrandProfile();
      if (response.success) {
        this.utilityService.hideLoading();
        this.myProfileForm.controls.companyName.setValue(response.data.company_info.company_name);
        this.myProfileForm.controls.companyEmail.setValue(response.data.user_info.email);
        this.myProfileForm.controls.companyMobile.setValue(response.data.company_info.phone);
        response.data.user_photo ? this.myProfileForm.controls.photo.setValue(response.data.user_photo) : '';
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      this.utilityService.showErrorToast('toast.failedFetchProfileData');
      this.utilityService.hideLoading();
    }
  }

  onSelectProfileImage(event: any) {
    const file: File = event.target.files[0];
    if (file.size === 0 || (file.size / 1000) > 500) {
      this.headerService.switchLanguage.subscribe(res => {
        if (res == 'es') {
          this.imageError = 'El tamaño de la imagen no debe superar los 500 KB';
        } else {
          this.imageError = 'Image size should not greater than 500 KB';
        }
      });
      return this.imageError;
    }
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      let filePath = file.name;
      let allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;
      if (!allowedExtensions.exec(filePath)) {
        this.headerService.switchLanguage.subscribe(res => {
          if (res == 'es') {
            this.imageError = 'La imagen debe estar en formato PNG o JPG.';
          } else {
            this.imageError = 'Image should be in PNG or JPG format';
          }
        });
        return this.imageError;
      } else {
        this.imageError = '';
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event: any) => {
          this.myProfileForm.controls.photo.setValue(event.target.result);
        }
      }
    }
  }

  deletePhoto(): void {
    this.myProfileForm.controls.photo.setValue('');
  }

  async updateProfile() {
    if (this.myProfileForm.invalid) {
      return
    }
    if (this.myProfileForm.value.photo) {
        this.image = this.myProfileForm.value.photo;
    }
    else {
      this.image = '';
    }

    const updateData: UpdateBrandProfileRequestParameters = {
      user_id: this.authService.getLoggedInUserDetail().user_info.id,
      company_name: this.myProfileForm.value.companyName,
      phone: this.myProfileForm.value.companyMobile,
      user_photo : this.image 
    };

    this.utilityService.showLoading();
    try {
      const response = await this.brandService.updateBrandProfile(updateData);
      if (response.success) {
        this.utilityService.hideLoading();
        this.utilityService.showSuccessToast('toast.profileDataUpdatedSucess');
        this.router.navigate(['/brand/profile'])
        .then(() => {
          window.location.reload();
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      this.utilityService.hideLoading();
    }
  }

}
