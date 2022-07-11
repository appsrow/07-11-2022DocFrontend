import { GenericResponse } from "src/app/shared/models/shared.model";
import { MyCampaignDetails } from "./myCampaign.model";

export interface StatisticsResponseData extends GenericResponse {
    data: CampaignDetailsObject
}


export interface CampaignDetailsObject {
    campaign_details: MyCampaignDetails,
    target_details: TargetDetails,
    budget_details: BudgetDetails,
    stastics: statisticsData[]
}

export interface TargetDetails {
    total_target: number,
    total_archived: number,
    target_percentage: number
}

export interface BudgetDetails {
    total_budget: number,
    total_left: number,
    total_spend: number
}

export interface statisticsData {
    dates?: string,
    months?: string,
    is_clicked: string,
    is_completed: string,
    month_week?: string
}