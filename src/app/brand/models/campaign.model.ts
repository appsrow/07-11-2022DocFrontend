import { AccountDetail, CompanyInformation, GenericResponse } from "src/app/shared/models/shared.model";

export interface CreateLeadCampaignRequestParameters {
    campaign_name: string,
    goal_of_campaign: string,
    start_date: string,
    end_date: string,
    product_information: string,
    cac: string,
    total_budget: string,
    coins: number,
    user_target:number,
    campaign_type: string,
    campaign_type_name : string,
    user_id: string,
    campaign_image: string,
    sub_total: string,
    tax_value: string,
    country: string,
    start_age: string,
    end_age: string,
    //age_group: string,
    gender: string
}

export interface CreateVideoCampaignRequestParameters extends CreateLeadCampaignRequestParameters{
    uploaded_video_url?: string,
    youtube_video_url?: string
}


export interface CreateFollowCampaignRequestParameters extends CreateLeadCampaignRequestParameters{
    selected_social_media_name: string,
    selected_social_media_url: string
}

export interface CreateAppsDownloadCampaignRequestParameters extends CreateLeadCampaignRequestParameters{
    app_download_link: string
}

export interface CreateClicksOnWebsiteCampaignRequestParameters extends CreateLeadCampaignRequestParameters{
    website_url: string
}

export interface getCampaignPositionRequestParameters{
    coin: number
}

export interface CampaignPosition extends GenericResponse{
    data:[
        {
            position : number
        }
    ]
}

export interface getHighestCacRequestParameters {
    campaign_type : string
}

export interface HighestCacResponse extends GenericResponse {
    data:[
        {
            max_cac : string
        }
    ]
}

export interface CampaignTargetInfo{
    id: string, 
    name:string, 
    apiCampaignName: string, 
    campaignDisplayName: string,
    icon: string, 
    socialLink?: string
}

export interface campaignInformation {
    campaign_name: string,
    goal_of_campaign: string,
    start_date: string,
    end_date: string,
    product_information: string,
    campaign_type: string,
    campaign_type_name : string,
    user_id: number,
    campaign_image: string,
    sub_total: number,
    tax_value: string,
    country: string,
    start_age: number,
    end_age: number, 
    gender: string,
    cac: number,
    total_budget: number,
    coins: number,
    user_target: number,
    campaign_position: number,
    uploaded_video_url: string,
    selected_social_media_name: string,
    selected_social_media_url: string,
    app_download_link: string,
    website_url: string,
}

export interface createCampaignResponseParameters extends GenericResponse{
    data: CommonCampaignTypeParameters
}

export interface CommonCampaignTypeParameters{
    id: number,
    company_id: number,
    campaign_type: string,
    campaign_type_name: string,
    campaign_name: string,
    goal_of_campaign: string,
    start_date: string,
    end_date: string,
    product_information: string,
    cac: string,
    total_budget: string,
    coins: string,
    sub_total: string,
    tax_value: string,
    user_target: string,
    campaign_image: string,
    uploaded_video_url: string,
    selected_social_media_name: string,
    selected_social_media_url: string,
    app_download_link: string,
    website_url: string,
    is_start: string,
    active: number,
    campaign_status: string,
    is_approved: string,
    note: string,
    country: string,
    start_age: string,
    end_age: string,
    gender: string,
    is_budget_revised: string,
    created_by: string,
    updated_by: string,
    is_deleted: string,
    created_at: string,
    updated_at: string,
    deleted_at: string
}