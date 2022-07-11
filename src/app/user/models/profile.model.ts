import { GenericResponse } from "src/app/shared/models/shared.model";

export interface UserProfileData extends GenericResponse {
    data: {
        country_name?: string;
        state_name?: string;
        user_info: UserProfileInformation;
        user_photo?: string;
    },
    datetime: number
}

export interface UserProfileInformation {
    city: string;
    country: string;
    dob: string;
    email: string;
    first_name: string;
    gender: string;
    id: number;
    last_name: string;
    phone: string;
    state: string;
    user_photo: string;
    country_dialing_code: string; 
    is_phone_confirmed: number
}

export interface UserProfileRequestParameters {
    user_id: number;
    first_name: string;
    last_name: string;
    dob: string;
    email: string;
    gender: string;
    city: string;
    country: number;
    state: number;
    phone: string;
    user_photo: any;
    country_dialing_code?: string; 
    is_phone_confirmed?: number;
}

export interface RedeemRewardsRequestParameters extends GenericResponse{
    data : RedeemRewardsParameters[];
}

export interface RedeemRewardsParameters {
    id: number;
    reward_id:number;
    name: string;
    description: string;
    coins: number;
    date: string;
    converted_transaction_date?:any;
    status: string;
}