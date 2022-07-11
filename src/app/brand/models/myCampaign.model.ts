import { CompanyInformation, GenericResponse } from "src/app/shared/models/shared.model";
import { campaignDetails } from "./wallet.model";

export interface UserIdRequestParameter{
    user_id: number
}

export interface MyCampaignResponseParameters extends GenericResponse{
    data: MyCampaignDetails[]
}

export interface MyCampaignDetails {
    id: number,
    company_id: number,
    campaign_type: string,
    campaign_type_name: string,
    campaign_name: string,
   // goal_of_campaign: string,
    start_date: string,
    end_date: string,
   // product_information: string,
    // cac: string,
    total_budget: string,
    // coins: string,
    sub_total: string,
    tax_value: string,
    user_target: string,
    campaign_image: string,
    // uploaded_video_url: string,
    // selected_social_media_name: string,
    // selected_social_media_url: string,
    // app_download_link: string,
    // website_url: string,
    is_start: string,
    active: number,
    campaign_status: string,
    is_approved: string,
    // note: string,
    // country: string,
    // start_age: number,
    // end_age: number,
    // gender: string,
    is_budget_revised: string,
    // created_by: string,
    // updated_by: string,
    // is_deleted: string,
    created_at: string,
    // updated_at: string,
    // deleted_at: string,
    campaign_details: campaignDetails,
    company_info: CompanyInformation
}

export interface StartStopRequestParameters extends GenericResponse{
    api_version: number,
    data: {
        is_start: string
    }
}

export interface EditCampaignResponseParameters extends GenericResponse{
    data: campaignEditParameters
}

export interface campaignEditParameters{
    id: number,
    company_id: number,
    campaign_type: string,
    campaign_type_name: string,
    campaign_name: string,
    goal_of_campaign: string,
    start_date: string,
    end_date: string,
    product_information: string,
    cac: number,
    total_budget: number,
    coins: number,
    sub_total: number,
    tax_value: number,
    user_target: number,
    campaign_image: string,
    uploaded_video_url: string,
    selected_social_media_name: string,
    selected_social_media_url: string,
    app_download_link: string,
    website_url: string,
    is_start: number,
    active: number,
    campaign_status: string,
    is_approved: string,
    note: string,
    country: number,
    start_age: number,
    end_age: number,
    gender: string,
    is_budget_revised: string,
    created_by: string,
    updated_by: string,
    is_deleted: number,
    created_at: string,
    updated_at: string,
    deleted_at: string
}

export interface campaignInformationResponse extends GenericResponse{
    data: CampaignInformation[],
    datetime:any
}

export interface CampaignInformation {
    id: number;
    company_id: number;
    campaign_type: string;
    campaign_type_name: string;
    campaign_name: string;
    goal_of_campaign: string;
    start_date: string;
    end_date: string;
    product_information: string;
    cac: string;
    total_budget: string;
    coins: string;
    sub_total: number;
    tax_value: string;
    user_target: string;
    campaign_image: any;
    uploaded_video_url: any;
    selected_social_media_name: any;
    selected_social_media_url: any;
    app_download_link: any;
    website_url: any;
    is_start: string;
    active: number;
    campaign_status: string;
    is_approved: string;
    note: string;
    country: string;
    start_age: string;
    end_age: string;
    gender: string;
    is_budget_revised: string;
    created_by: string;
    updated_by: string;
    is_deleted: string;
    created_at: string;
    updated_at: string;
    deleted_at: string;
    video_id?: any;
    youtube_video_url?: string;
}