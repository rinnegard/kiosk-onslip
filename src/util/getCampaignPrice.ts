import { API } from "@onslip/onslip-360-web-api";
import { initializeApi } from "../api/config";

export async function getCampaignPriceForItem(item: API.Item): Promise<number> {
    const { campaign: campaignId, quantity, price } = item;

    if (price == undefined) {
        return 0;
    }

    let reducedPrice = price * quantity;

    if (!campaignId) return reducedPrice;

    const api = initializeApi();
    const campaign = await api.getCampaign(campaignId);

    if (!campaign) return reducedPrice;

    if (campaign.rules.length > 1) {
        return reducedPrice;
    }

    switch (campaign.type) {
        case "fixed-amount":
            reducedPrice = (price - (campaign.amount || 0)) * quantity;
            break;
        case "percentage":
            reducedPrice =
                price * quantity * (1 - (campaign["discount-rate"] || 0) / 100);
            break;
        case "fixed-price":
            const requiredQuantity = campaign.rules[0]?.quantity || 1;
            if (quantity >= requiredQuantity) {
                const remainingQuantity = quantity % requiredQuantity;
                const divisibleUnits = Math.floor(quantity / requiredQuantity);

                reducedPrice =
                    campaign.amount! * divisibleUnits +
                    price * remainingQuantity;
            }
            break;
        case "cheapest-free":
            if (quantity >= campaign.rules[0].quantity) {
                const freeItems = Math.floor(
                    quantity / campaign.rules[0].quantity
                );
                const discount = freeItems * price;
                reducedPrice = price * quantity - discount;

                break;
            }
            break;
        default:
            break;
    }

    return reducedPrice;
}
