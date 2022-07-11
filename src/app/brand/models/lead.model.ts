import { CompanyInformation, GenericResponse } from "src/app/shared/models/shared.model";
import { campaignInformation } from "./campaign.model";

export interface LeadUsersResponseParameters extends GenericResponse{
    data: CampaignLeadDetailsInfo
}
export interface CampaignLeadDetailsInfo{
    campaign_details: CampaignLeadDetails,
    user_details: campaignLeadUserDetails[]
}
export interface CampaignLeadDetails{
    id: number,
    company_id: number,
    campaign_type: string,
    campaign_type_name: string,
    campaign_name: string
}

export interface campaignLeadUserDetails{
    first_name: string,
    last_name: string,
    dob: string,
    email: string,
    gender: string,
    city: string,
    country: number,
    phone: string,
    country_name: string,
    state_name: string
}

export interface LeadCampaignResponseParameters extends GenericResponse{
    data: LeadCampaignDetails[]
}

export interface LeadCampaignDetails{
    id: number,
    //company_id: number,
    campaign_type: string,
    campaign_type_name: string,
    campaign_name: string,
   // goal_of_campaign: string,
    start_date: string,
    end_date: string,
   // product_information: string,
    // cac: number,
    total_budget: number,
    // coins: number,
    // sub_total: number,
    // tax_value: number,
    user_target: number,
    // campaign_image: string,
    // uploaded_video_url: string,
    // selected_social_media_name: string,
    // selected_social_media_url: string,
    // app_download_link: string,
    // website_url: string,
    // is_start: number,
    // active: number,
    // campaign_status: string,
    // is_approved: string,
    // note: string,
    // country: number,
    // start_age: number,
    // end_age: number,
    // gender: string,
    // is_budget_revised: string,
    // created_by: string,
    // updated_by: string,
    // is_deleted: number,
    created_at: string,
    // updated_at: string,
    // deleted_at: string,
    // company_info: CompanyInformation[]
}
