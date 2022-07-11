export interface GenericResponse {
    success: boolean;
    message: string;
    api_version?: number;
    datetime?:number
}

export interface AccountDetail {
    api_token: string;
   // token_expires_in?: number;
    user_info: UserInformation;
    company_info?: CompanyInformation;
}

export interface UserInformation {
    active: number;
    city: string;
    confirmation_code: string;
    confirmation_code_expired: string;
    confirmed: number;
    country: string;
    created_at: string;
    created_by: number;
    deleted_at: string;
    dob: string;
    email: string;
    first_name: string;
    gender: string;
    id: number;
    is_deleted: string;
    is_social_sign_in: string;
    last_name: string;
    phone: string;
    photo?: {
        original: string;
    },
    state: string;
    updated_at: string;
    updated_by: number;
    user_type: string;
    user_photo?: string;
}

export interface CompanyInformation {
    active: number;
    company_name: string;
    created_at: string;
    created_by: number;
    deleted_at: string;
    id: number;
    phone: string;
    updated_at: string;
    updated_by: number;
    user_id: number;
}

export interface EmailConfirmationParameters {
    email: string;
}

export interface UserCoinsData extends GenericResponse {
    data: {
        wallet_balance: number;
    }
}

export interface LoginRequestParameters {
    email: string;
    password: string;
}

export interface LoginResponseData extends GenericResponse {
    data: AccountDetail;
}

export interface ResetPasswordRequestParameters {
    password: string;
    password_confirmation: string;
    token: any;
}
export interface ChangePasswordRequestParameters {
    old_password: string;
    new_password: string;
    token: any;
}