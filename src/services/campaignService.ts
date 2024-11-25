import { API } from '@onslip/onslip-360-api';
import { Campaign, ProductCampaign, isValidCampaign } from '../types/campaignTypes';
import { initializeApi } from '../api/config';

export const fetchCampaigns = async (): Promise<Campaign[]> => {
    const api = initializeApi();
    const campaigns = await api.listCampaigns();
    return campaigns.filter(isValidCampaign);
};

export const findCampaignsForProduct = (campaigns: Campaign[], productId: number): ProductCampaign[] => {
    return campaigns
        .filter(campaign => 
            campaign.rules.some(rule => rule.products.includes(productId))
        )
        .map(campaign => {
            const rule = campaign.rules.find(r => r.products.includes(productId));
            
            if (!campaign.id) {
                return null;
            }

            const productCampaign: ProductCampaign = {
                id: campaign.id,
                name: campaign.name,
                type: campaign.type,
                discountRate: campaign['discount-rate'],
                amount: campaign.amount,
                quantity: rule?.quantity
            };
            
            return productCampaign;
        })
        .filter((campaign): campaign is ProductCampaign => campaign !== null);
};

export const calculateDiscountedPrice = (
    originalPrice: number,
    campaign: ProductCampaign
): number => {
    switch (campaign.type) {
        case 'percentage':
            if (campaign.discountRate) {
                return originalPrice * (1 - campaign.discountRate / 100);
            }
            return originalPrice;
            
        case 'fixed-amount':
            if (campaign.amount) {
                return Math.max(0, originalPrice - campaign.amount);
            }
            return originalPrice;
            
        case 'cheapest-free':
            if (campaign.quantity && campaign.quantity > 1) {
                return originalPrice * ((campaign.quantity - 1) / campaign.quantity);
            }
            return originalPrice;
            
        case 'fixed-price':
            if (campaign.amount) {
                return campaign.amount;
            }
            return originalPrice;
            
        default:
            return originalPrice;
    }
};