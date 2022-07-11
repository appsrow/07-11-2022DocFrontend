import { CompanyInformation, GenericResponse } from "src/app/shared/models/shared.model";

export interface Task extends GenericResponse {
    data: TaskDetail[]
}

export interface TaskDetail {
    active: number;
    app_download_link: string;
    cac: string;
    campaign_image: string;
    campaign_name: string;
    campaign_type: string;
    campaign_type_name: string;
    coins: number;
    company_id: number;
    company_info: CompanyInformation[];
    created_at: string;
    created_by: number;
    deleted_at: string;
    end_date: string;
    goal_of_campaign: string;
    id: number;
    is_deleted: string;
    is_start: string;
    product_information: string;
    selected_social_media_name: string;
    selected_social_media_url: string;
    start_date: string;
    total_budget: string;
    updated_at: string;
    updated_by: number;
    uploaded_video_url?: string;
    youtube_video_url?: string;
    user_target: string;
    website_url: string;
    credit?: string;
    video_id?: string;
}
export interface TaskParameters {
    user_id: number;
}
export interface RewardsRequestParameters {
    user_id: number;
}

export interface Rewards extends GenericResponse {
    data: {
        rewards: RewardsDetail[]
    }
}

export interface RewardsDetail {
    active: number;
    created_at: string;
    description: string;
    id: number;
    is_deleted: string;
    minimum_coins: number;
    name: string;
    percentage: number;
    photo: string;
    updated_at: string;
    amount: number;
}
export interface paypalRewardDataParameters {
    rewards_id: string;
    receiver: string;
    value: string;
}
export interface CompleteTaskRequestParameters {
    user_id: number;
    campaign_id: string;
    campaign_type: string;
}

export interface CampaignClickedParameters {
    campaign_id: string;
    brand_id: string;
}
export interface CampaignClickedData extends GenericResponse {
    data: {
        brand_id: number;
        campaign_id: number;
        user_id: number;
        is_clicked: number;
        updated_at: string;
        created_at: string;
        id: number;
    }
}
export interface CompleteTaskData extends GenericResponse {
    data: {
        campaign_id: number;
        closing_balance: number;
        created_at: string;
        created_by: number;
        credit: number;
        id: number;
        opening_balance: string;
        updated_at: string;
        updated_by: number;
        user_id: number;
        coins: string;
    }
}
export interface twitterAuthDetails extends GenericResponse {
    api_version: number;
    data: {
        url: string;
    }
}
export interface twitterAuth2Parameters {
    campaign_id: any;
    oauth_token: any;
    oauth_verifier: any;
    target_screen_name: any;
}
export interface twitterAuth2 extends GenericResponse {
    api_version: number;
    data: {
        data: {
            following: boolean;
            pending_follow: boolean;
        }
    }
}