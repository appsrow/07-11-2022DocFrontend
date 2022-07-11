import { AccountDetail, CompanyInformation, GenericResponse } from "src/app/shared/models/shared.model";

export interface BrandRegistrationRequestParameters {
    company_name: string;
    confirm_password: string;
    email: string;
    password: string;
    phone: string;
}

export interface BrandRegistrationData extends GenericResponse {
    data: AccountData;
}

export interface AccountData extends AccountDetail {
    company_info: CompanyInformation;
}

export interface EmailConfirmationRequestParameters {
    email: string;
}

export interface BrandRegistrationResponseValue extends GenericResponse {
    api_version?: number,
    data: BrandRegistrationResponseData
}

export interface BrandRegistrationResponseData {
    id: number,
    first_name: string,
    last_name: string,
    dob: string,
    email: string,
    gender: string,
    city: string,
    state: string,
    country: string,
    phone: string,
    user_photo: string,
    active: number,
    is_social_sign_in: number,
    confirmation_code: number,
    confirmation_code_expired: string,
    confirmed: number,
    created_by: string,
    updated_by: string,
    user_type: number,
    is_deleted: number,
    created_at: string,
    updated_at: string,
    deleted_at: string,
    company_info:any
}