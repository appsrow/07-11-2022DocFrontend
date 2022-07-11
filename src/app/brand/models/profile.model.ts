import { AccountDetail, CompanyInformation, GenericResponse, UserInformation } from "src/app/shared/models/shared.model";

export interface BrandProfileData extends GenericResponse {
    data: {
        company_info: CompanyInformation;
        user_info: UserInformation;
        user_photo?: string;
    },
    datetime: number;
}

export interface UpdateBrandProfileRequestParameters {
    user_id: number;
    company_name: string;
    phone: string;
    user_photo: string;
}

export interface UpdateBrandProfileData extends GenericResponse {
    data: {
        company_info: CompanyInformation;
    }
}