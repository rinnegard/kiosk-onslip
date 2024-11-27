import { API } from "@onslip/onslip-360-web-api";

export function findBestCampaign(
    filteredCampaigns: API.Campaign[],
    productPrice: number
): API.Campaign | null {
    if (!filteredCampaigns.length) return null;

    return filteredCampaigns.reduce<API.Campaign | null>(
        (bestCampaign, currentCampaign) => {
            let currentReducedPrice = productPrice;
            let bestReducedPrice = productPrice;

            if (bestCampaign) {
                switch (bestCampaign.type) {
                    case "fixed-amount":
                        bestReducedPrice =
                            productPrice - (bestCampaign.amount || 0);
                        break;
                    case "percentage":
                        bestReducedPrice =
                            productPrice *
                            (1 - (bestCampaign["discount-rate"] || 0) / 100);
                        break;
                    case "fixed-price":
                        bestReducedPrice = bestCampaign.amount || productPrice;
                        break;
                    default:
                        break;
                }
            }

            switch (currentCampaign.type) {
                case "fixed-amount":
                    currentReducedPrice =
                        productPrice - (currentCampaign.amount || 0);
                    break;
                case "percentage":
                    currentReducedPrice =
                        productPrice *
                        (1 - (currentCampaign["discount-rate"] || 0) / 100);
                    break;
                case "fixed-price":
                    currentReducedPrice =
                        currentCampaign.amount || productPrice;
                    break;
                default:
                    break;
            }

            return !bestCampaign || currentReducedPrice < bestReducedPrice
                ? currentCampaign
                : bestCampaign;
        },
        null
    );
}
