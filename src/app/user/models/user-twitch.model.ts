import { GenericResponse } from "src/app/shared/models/shared.model";

export interface StreamersInfo {
    id: string;
    display_name: string;
    profile_image_url: string;
    view_count: number;
    coins: number;
    discounted_coins: number;
    standard_coins: number;
}

export interface TwitchPromotedStreamersListRequestData {
    limit: number;
    page: number;
}

export interface TwitchPromotedStreamersListResponseData extends GenericResponse {
    data: {
        totalRecords: number;
        totalPages: number;
        limit: number;
        page: number;
        records: StreamersInfo[];
    }
}

export interface UserProfileDataResponse extends GenericResponse {
    data: {
        id: string;
        display_name: string;
        login: string;
        profile_image_url: string;
        view_count: number;
    }
}

export interface SearchStreamerResponse extends GenericResponse {
    data: {
        records: StreamersInfo[];
        pagination: {
            cursor: string;
        }
    }
}

export interface SearchStreamerRequestData {
    limit: number;
    cursor: string;
    search: string;
}

export interface TwitchSubscriptionRequestData {
    user_twitch_id: string;
    streamer_twitch_id: string;
    rewards_id: number
}

export interface TwitchSubsriptionResponseData extends GenericResponse {
    data: {
        subscription_price: number;
    }
}