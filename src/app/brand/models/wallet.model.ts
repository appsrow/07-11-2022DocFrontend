import { GenericResponse } from "src/app/shared/models/shared.model";

export interface WalletDetailData extends GenericResponse{
    data: {
        campaigns: WalletData[];
        my_balance: number;
    }
}

export interface WalletData{
        id: number;
        company_id: number;
        campaign_type: string;
        campaign_name: string;
        campaign_type_name: string;
        sub_total: number;
       // goal_of_campaign: string;
        // start_date: string;
        // end_date: string;
        // product_information: string;
        // cac: string;
        // total_budget: string;
        // coins: string;
        // user_target: string;
        campaign_image: string;
        // uploaded_video_url: any;
        // selected_social_media_name?: any;
        // selected_social_media_url?: any;
        // app_download_link: any;
        // website_url?: any;
        // is_start: string;
        // active: number;
        // campaign_status: string;
        // created_by?: any;
        // updated_by?: any;
        // is_deleted: any;
        // created_at: string;
        // updated_at: string;
        // deleted_at?: any;
        campaign_details: campaignDetails;
    }

export class campaignDetails{
    spend_euro: number = 0;
    left_euro: number = 0;
    percentage: number = 0;    
}