import { API } from "@onslip/onslip-360-web-api";
import { initializeApi } from "../api/config";

export async function getCampaignPriceForItem(
    item: API.Item
): Promise<number | undefined> {
    const { campaign: campaignId, quantity, price } = item;

    if (!campaignId || price === undefined) return price;

    const api = initializeApi();
    const campaign = await api.getCampaign(campaignId);
    console.log(campaign.name, campaign);

    if (!campaign) return price;

    let reducedPrice = price * quantity;

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
                reducedPrice = campaign.amount!;
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
