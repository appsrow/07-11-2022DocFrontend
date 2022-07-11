import {  GenericResponse } from "src/app/shared/models/shared.model";

export interface Brand extends GenericResponse {
    api_version: number;
    data: BrandDetailsInformation[];
}
export interface BrandDetailsData extends GenericResponse {
    data: {
        campaign_details:  CampaignListDetail[];
        company_info: CompanyInformation;
        id: number;
        email: string;
        user_photo: string;
        active: number;
        created_at: string;
        converted_created_at: string;
    }
}
export interface BrandDetailsObject {
        campaign_details:  CampaignListDetail[];
        company_info: CompanyInformation;
        id: number;
        email: string;
        user_photo: string;
        active: number;
        created_at: string;
        converted_created_at: string;
}
export interface BrandDetailsInformation {

        id: number;
        email: string;
        active: number;
        confirmed: number;
        created_at: string;
        converted_created_at: string;
        company_info: CompanyInformation[];

}
export interface CompanyInformation {
        company_name: string;
        created_at: string;
        id: number;
        phone: string
        user_id: number;
}

export interface CampaignList extends GenericResponse {
    data: CampaignListDetail[]
}
export interface CampaignListObject extends GenericResponse {
    data: CampaignListDetail
}
export interface CampaignListDetail {

    id: number;
    company_id: number;
    campaign_type: string;
    campaign_type_name: string;
    campaign_name: string;
    goal_of_campaign: any;
    start_date: any;
    end_date: any;
    product_information: string;
    cac: string;
    total_budget: string;
    coins: string;
    sub_total: string;
    tax_value: string;
    user_target: string;
    campaign_image: string;
    uploaded_video_url: string;
    selected_social_media_name: string;
    selected_social_media_url: string;
    app_download_link: string;
    website_url: string;
    is_start: string;
    active: number;
    campaign_status: string;
    is_approved: string;
    note: string;
    country: any;
    start_age: any;
    end_age: any;
    gender: any;
    is_budget_revised: string;
    created_by: any;
    updated_by: any
    is_deleted: string;
    created_at: string;
    updated_at: string;
    deleted_at: any;
    transaction_type: string;
    converted_created_at?: any;
    company_info: CompanyInformation[];
    video_id?: string;
    youtube_video_url?: string;

}
export interface DashboardBrandList extends GenericResponse {
    data: DashboardBrandListDetail[]
}
export interface DashboardBrandListDetail {
    Month: string;
    Count: number;
}
export interface DashboardCount extends GenericResponse {
    data: {
        totalBrands: number
        totalFund: number
        totalProfit: number
        totalSpent: number
        totalUsers: number
    },
    api_version:number;
    
}
export interface HighestpPaidCampaignsParameters{
    from: string;
    to: string;
}
export interface HighestpPaidCampaigns extends GenericResponse {
    data: HighestpPaidCampaignsDetails[]
}
export interface HighestpPaidCampaignsDetails {
    id: number;
    campaign: string;
    category: string;
    brand: string;
    amount: string;
    startDate: string;
}
export interface InvoiceList extends GenericResponse {
    api_version: number;
    data: InvoiceListDetails[];
}
export interface InvoiceListDetails {
    id: number;
    invoice_id: string;
    invoice_date: string;
    grand_total: string;
    campaign_name?: string;
    campaign_type?: string;
    campaign_type_name?: string;
    company_name?: string;
    converted_InvoiceDate?:any;
}
export interface PaymentDetailsList extends GenericResponse {
    api_version:number;
    data: PaymentDetailsListData[];
}
export interface PaymentDetailsListData {
    campaign_id: number;
    campaign_info: {id: number, campaign_name: string, campaign_type: string, campaign_type_name: string}
    grand_total:string;
    id: number;
    invoice_details: {id: number, invoice_id: number, campaign_id: number, payment_id: string}
    invoice_id: string;
    rewards_id: string;
    transaction_date: string;
    transaction_id: string;
    transaction_status: string;
    transaction_type: string;
    user_id: number;
    
}
export interface CampaignStatisticsParameters {
    campaign_id: number;
    from_date: string;
    to_date: string;
}
export interface CampaignStatisticsDataList extends GenericResponse {
    api_version:number;
    data: CampaignStatisticsData;
}
export interface CampaignStatisticsData {
    budget_details: BudgetDetailsData;
    campaign_details: CampaignListDetail;
    stastics: StasticsData[];
    target_details: TargetData;
}
export interface BudgetDetailsData{
    total_budget: number;
    total_left: number;
    total_spend: number;
}
export interface StasticsData{
    dates: string;
    is_clicked: string;
    is_completed: string;
}
export interface TargetData{
    total_target: number;
    total_archived: number;
    target_percentage: number;
}
export interface DownloadInvoice extends GenericResponse {
    data: string;
    api_version:number;
}
export interface ChangeStatusDataParameters {
    user_id: string;
    active: number;
}
export interface ChangeStatusData extends GenericResponse {
    data: {active: number},
    api_version:number;
}
export interface ApprovedOrRejectCampaignData extends GenericResponse {
    data: {
        is_approved: string,
        note: string
    },
    api_version:number;
    
}
export interface ApprovedOrRejectCampaignParameters {
    campaign_id: number,
    company_id: number,
    is_approved: string,
    note: string
}
export interface ReportList extends GenericResponse {
    data: {
        file: string;
        records:ReportListDetails[];
    }
}
export interface ReportListDetails {
    AllocatedFund: string;
    BrandName: string;
    CampaignFunding: string;
    CampaignId: number;
    CampaignName: string;
    CampaignStatus: number;
    CompletedUsers: number;
    CreditFund: string;
    EndDate: string;
    EstimatedProfit: string;
    ShortFall: number;
    StartDate: string
    TargetedUsers: string;
    Type: string;
    UserId: number;
}
export interface ReportDataParameters {
    from: string;
    to: string;
    brand:string;
    type:string;
    campaign:string;
    status:string;
    isExport?:boolean;
}
export interface ReportArrayCampaignType {
    id: number;
    itemName:string;
    type:string;
}
export interface ReportArrayCampaign {
    id: number;
    itemName:string;
}
export interface ReportArrayBrand {
    id: number;
    itemName:string;
}
export interface ReportArrayStatus {
    id: number;
    itemName:string;
}
export interface UserList extends GenericResponse {
    data: UserListDetails[];
}
export interface UserDetails extends GenericResponse {
    data: UserListDetails;
}
export interface UserListDetails {
    active: number;
    city: string;
    confirmation_code: string;
    confirmation_code_expired: string;
    confirmed: number;
    state_name?:string;
    country_name?:string;
    converted_created_at?: string;
    country: string;
    created_at: string;
    created_by: any;
    deleted_at: any;
    dob: string;
    email: string;
    first_name: string;
    gender: string;
    id: number;
    is_deleted: string;
    is_social_sign_in: string;
    last_name: string;
    phone: string;
    state: string;
    updated_at: string;
    updated_by: any;
    user_photo: any;
    user_type: string;
}

export interface GiftCardsList extends GenericResponse {
    data: GiftCardsListDetails[]
}

export interface GiftCardsListDetails{
    id: number,
    card_code: string,
    type: string,
    amount: string,
    price: number,
    currency_code: string,
    user_photo: string,
    status: string,
    redeemed_at: string,
    expiry_date: string,
    created_at: string,
    updated_at: string,
    converted_created_at: string,
    converted_expiry_date: string
}

export interface InsertGiftCardRequestParams {
    gift_card_code : string,
    gift_card_type : string,
    coins : number,
    gift_card_amount: number,
    expiry_date :  string,
    currency_code: string,
    status: string,
}

export interface InsertGiftCardResponse extends GenericResponse {
    data: {}
}

export interface ChangeStatusRequestParams {
    gift_card_id: number,
    status: string
}

export interface ChangeStatusResponse extends GenericResponse{
    data: {}
}

export interface GiftCardTypes extends GenericResponse {
   data:{
        id: number,
        itemName: string
   }
}

export interface InternalDashboardKpiResponse extends GenericResponse{
    data: {
        logged_users: number,
        active_users: number,
        count_current_campaigns: number,
        count_active_tasks: number,
        total_users_unspend_coins: string,
        total_users_unspend_coins_euros: string;
        count_users_registered: number,
        retention_users: number,
        sessions_per_user: number,
        ltv_days: number,
        campaigns_approved: number,
        tasks: number,
        estimated_revenue: string,
        campaign_unspent_funds: string,
        rewards_count_in_period: number,
        final_conversion_rate: string,
        rewards_cost: string,
        rewards_per_users: string,
        rewards_cost_in_period: number,
        rewards_cost_in_period_euro: string
    }
}

export interface InternalDashboardKpiRequestData {
    start_date: string,
    end_date: string
}