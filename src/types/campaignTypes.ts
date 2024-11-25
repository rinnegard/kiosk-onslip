import { API } from '@onslip/onslip-360-api';

export type Campaign = API.Campaign;
export type CampaignRule = {
    quantity: number;
    products: number[];
    labels: string[];
};

export interface ProductCampaign {
    id: number;
    name: string;
    type: API.Campaign.Type;
    discountRate?: number;
    amount?: number;
    quantity?: number;
}

export const isCampaignType = (type: string): type is API.Campaign.Type => {
    return ['fixed-amount', 'cheapest-free', 'percentage', 'fixed-price'].includes(type);
};

export const isValidCampaign = (campaign: Partial<Campaign>): campaign is Campaign => {
    return typeof campaign.id === 'number' && 
           typeof campaign.name === 'string' && 
           typeof campaign.type === 'string' &&
           Array.isArray(campaign.rules);
};