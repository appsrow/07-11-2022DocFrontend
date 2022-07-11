import { GenericResponse } from "src/app/shared/models/shared.model";
export interface GenderList {
    id: number;
    itemName:string;
}
export interface Country extends GenericResponse {
    data: CountryList[];
}

export interface CountryList {
    id: number;
    itemName:string;
}

export interface State extends GenericResponse {
    data: StateList[];
}

export interface StateList {
   
    state_name?: string;
    id: any;
    itemName:any;
}

export interface RegistrationRequestParameters {
    first_name: string;
    last_name: string;
    gender: string;
    dob: string;
    password: string;
    phone: string;
    email: string;
    country: string;
    city: string;
    state: string;
    confirm_password: string;
    referral_streamer_name?: string;
    country_dialing_code?: string;
    is_phone_confirmed: number;
}

export interface RegisterData extends GenericResponse {
    active: string;
    city: string;
    confirmation_code: string;
    confirmation_code_expired: string;
    confirmed: string;
    country: string;
    created_at: string;
    created_by: string;
    deleted_at: string;
    dob: string;
    email: string;
    first_name: string;
    gender: string;
    id: string;
    is_deleted: string;
    is_social_sign_in: string;
    last_name: string;
    phone: string;
    state: string;
    updated_at: string;
    updated_by: string;
    user_photo: string;
    user_type: string;
}

export interface GoogleLoginRequestParameters {
    email: string;
    first_name: string;
    last_name: string;
    authToken: string;
    is_social_sign_in: string;
    referral_streamer_name?: string
}

export interface GoogleLoginData extends GenericResponse {
    api_token: string;
    user_info: RegisterData;
    data?: any;
}

export interface RequestSmsRequestData {
    phone_number: string;
    country_dialing_code: string;
}

export interface RequestSmsResponseData extends GenericResponse {
    data?:any;
}

export interface VerifyCodeRequestData {
    phone_number: string;
    code: string;
    country_dialing_code: string;
}

