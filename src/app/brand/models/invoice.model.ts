import { GenericResponse } from "src/app/shared/models/shared.model";

export interface InvoiceDetailData extends GenericResponse{
    data: InvoiceData[];
}

export interface InvoiceData{
    id: number;
    invoice_id: number;
    // user_id: number;
    // campaign_id: number;
    // payment_id: string;
    // sub_total: number;
    // discount: number;
    // final_total: number;
    // tax_percentage: number;
    // tax_value: number;
    grand_total: number;
    // created_at: any;
    // updated_at: any;
    // deleted_at: any;
    campaign_name: string;
    campaign_type: string;
    converted_InvoiceDate: string;
    invoice_date: string;    
    }

