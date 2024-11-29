import { API } from "@onslip/onslip-360-web-api";
import { initializeApi } from "../api/config";
import { getCampaignPriceForItem } from "./getCampaignPrice";

export async function calcTotal(items: API.Item[]) {
    let discountedTotal = 0;

    // Deep clone the cart items to avoid mutating the original ones
    const cartItems = structuredClone(items);

    const api = initializeApi();
    const campaigns = await api.listCampaigns();

    // Filter multi-item campaigns (those that involve multiple products)
    const multiItemCampaigns = campaigns.filter((campaign) => {
        return (
            campaign.rules.length > 1 || campaign.rules[0].products.length > 1
        );
    });

    // Process each campaign
    multiItemCampaigns.forEach((campaign) => {
        const { amount, rules } = campaign;

        // If the campaign involves "any combination of items" (like 3 for 30)
        if (rules.every((rule) => rule.products.length > 1)) {
            let canApply = true;

            while (canApply) {
                // Flatten all products into a single list
                const allProducts = cartItems.flatMap((item) =>
                    item.product ? Array(item.quantity).fill(item.product) : []
                );

                const campaignQuantity = rules[0].quantity; // Get the quantity needed for the campaign

                if (allProducts.length >= campaignQuantity) {
                    // We can apply the discount for every 'campaignQuantity' items
                    discountedTotal += amount!; // Add the campaign discount
                    // Deduct 'campaignQuantity' items from the cart
                    let count = campaignQuantity;
                    cartItems.forEach((item) => {
                        if (item.product && count > 0 && item.quantity > 0) {
                            const takeQuantity = Math.min(item.quantity, count);
                            item.quantity -= takeQuantity;
                            count -= takeQuantity;
                        }
                    });
                } else {
                    canApply = false;
                }
            }
        }
        // Handle exact product combinations (like 1 Fanta and 1 Coke for 5)
        else {
            let canApply = true;

            while (canApply) {
                const matchedItems = rules.map((rule) => {
                    const { quantity, products } = rule;
                    return cartItems.find(
                        (item) =>
                            products.includes(item.product!) &&
                            item.quantity >= quantity
                    );
                });

                // If any product combination cannot be matched, break the loop
                if (matchedItems.some((item) => !item)) {
                    canApply = false;
                    break;
                }

                // Apply the campaign and reduce quantities for matched items
                matchedItems.forEach((item, index) => {
                    item!.quantity -= rules[index].quantity;
                });

                // Apply the campaign discount
                discountedTotal += amount!;
            }
        }
    });

    // Calculate the total for the remaining items at their regular prices
    const prices = await Promise.all(
        cartItems.map((item) => getCampaignPriceForItem(item))
    );

    const remainingTotal = prices.reduce((sum, price) => sum + price, 0);

    return discountedTotal + remainingTotal;
}

export const calcTotalWithoutCampaigns = (items: API.Item[]): number => {
    return items.reduce((sum, item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        return sum + itemTotal;
    }, 0);
};
