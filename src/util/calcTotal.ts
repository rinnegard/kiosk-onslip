import { API } from "@onslip/onslip-360-web-api";
import { initializeApi } from "../api/config";
import { getCampaignPriceForItem } from "./getCampaignPrice";

export async function calcTotal(items: API.Item[]) {
    let discountedTotal = 0;

    const cartItems: API.Item[] = structuredClone(items);

    const sortedCart = cartItems.toSorted((item1, item2) => {
        if (item1.price && item2.price) {
            return item2.price - item1.price;
        }
        return 0;
    });

    const api = initializeApi();
    const campaigns = await api.listCampaigns();

    const multiItemCampaigns = campaigns.filter((campaign) => {
        return (
            campaign.rules.length > 1 || campaign.rules[0]?.products.length > 1
        );
    });

    multiItemCampaigns.forEach((campaign) => {
        const { amount, rules } = campaign;

        if (
            campaign.rules.length > 1 ||
            campaign.rules[0].products.length > 1
        ) {
            if (campaign.type === "cheapest-free") {
                console.log("chepest", campaign.name);

                campaign.rules.forEach((rule) => {
                    const { quantity, products } = rule;

                    // Find matched items based on the rule's products
                    const matchedItems = products
                        .map((product) => {
                            return sortedCart.filter(
                                (item) =>
                                    item.product === product &&
                                    item.quantity >= quantity
                            );
                        })
                        .flat();

                    if (matchedItems.length > 0) {
                        // Sort matched items by price to find the cheapest one
                        const cheapestItem = matchedItems.sort(
                            (a, b) => (a!.price || 0) - (b!.price || 0)
                        )[0];

                        if (cheapestItem) {
                            // Subtract the price of the cheapest item from the total (apply discount)
                            discountedTotal -= cheapestItem.price!;

                            // Reduce the quantity for the matched items (since they get the discount)
                            matchedItems.forEach((item) => {
                                if (item) {
                                    item.quantity -= 1; // Decrease the quantity of the cheapest item
                                }
                            });
                        }
                    }
                });
            } else if (
                campaign.type === "fixed-price" &&
                campaign.rules.length <= 1
            ) {
                console.log("fixed-price1", campaign.name);
                while (true) {
                    // Gather all products eligible for this campaign
                    const eligibleProducts = sortedCart.filter((item) =>
                        rules.some((rule) =>
                            rule.products.includes(item.product!)
                        )
                    );

                    const allProducts = eligibleProducts.flatMap((item) =>
                        Array(item.quantity).fill(item)
                    );

                    const campaignQuantity = rules[0].quantity;

                    if (allProducts.length >= campaignQuantity) {
                        discountedTotal += amount!; // Apply the fixed price
                        let count = campaignQuantity;

                        eligibleProducts.forEach((item) => {
                            if (count > 0 && item.quantity > 0) {
                                const takeQuantity = Math.min(
                                    item.quantity,
                                    count
                                );
                                item.quantity -= takeQuantity;
                                count -= takeQuantity;
                            }
                        });

                        // Break when no more full sets can be formed
                        if (count > 0) break;
                    } else {
                        break; // Exit if not enough items to meet the requirement
                    }
                }
            } else if (
                campaign.type === "fixed-amount" ||
                campaign.type === "percentage"
            ) {
                console.log("percentfixed", campaign.name);

                while (true) {
                    // Gather all products eligible for this campaign
                    const eligibleProducts = sortedCart.filter((item) =>
                        rules.some((rule) =>
                            rule.products.includes(item.product!)
                        )
                    );

                    const allProducts = eligibleProducts.flatMap((item) =>
                        Array(item.quantity).fill(item)
                    );

                    const campaignQuantity = rules[0].quantity;

                    if (allProducts.length >= campaignQuantity) {
                        let totalEligiblePrice = 0;
                        let totalDiscountedPrice = 0;
                        let count = campaignQuantity;

                        eligibleProducts.forEach((item) => {
                            if (count <= 0) return;

                            const takeQuantity = Math.min(item.quantity, count);
                            totalEligiblePrice +=
                                (item.price || 0) * takeQuantity;
                            item.quantity -= takeQuantity;
                            count -= takeQuantity;
                        });

                        if (campaign.type === "fixed-amount") {
                            // Calculate the discount amount (fixed amount for the first campaignQuantity items)
                            if (count === 0) {
                                totalDiscountedPrice = amount!; // Only apply the discount once all eligible items are accounted for
                            }

                            // Apply the discount to the total price of eligible items
                            discountedTotal +=
                                totalEligiblePrice - totalDiscountedPrice;
                        } else {
                            if (count === 0) {
                                totalDiscountedPrice =
                                    (totalEligiblePrice *
                                        (campaign["discount-rate"] || 0)) /
                                    100;
                            }

                            // Apply the discount to the total price of eligible items
                            discountedTotal +=
                                totalEligiblePrice - totalDiscountedPrice;
                        }
                    }

                    // Exit the loop if not enough items to meet the requirement
                    break;
                }
            } else if (rules.every((rule) => rule.products.length > 1)) {
                console.log("other", campaign.name);
                while (true) {
                    const allProducts = sortedCart.flatMap((item) =>
                        item.product
                            ? Array(item.quantity).fill(item.product)
                            : []
                    );

                    const campaignQuantity = rules[0].quantity;

                    // Break if there aren't enough items for the campaign
                    if (allProducts.length < campaignQuantity) break;

                    let count = campaignQuantity;
                    let foundMatch = false;

                    sortedCart.forEach((item) => {
                        const isProductInCampaign = rules.some((rule) =>
                            rule.products.includes(item.product!)
                        );

                        if (
                            isProductInCampaign &&
                            count > 0 &&
                            item.quantity > 0
                        ) {
                            foundMatch = true;
                            const takeQuantity = Math.min(item.quantity, count);
                            discountedTotal += amount!;

                            item.quantity -= takeQuantity;
                            count -= takeQuantity;
                        }
                    });

                    // If no matches were found or all required quantities were reduced, break
                    if (!foundMatch || count <= 0) break;
                }
            } else {
                console.log("else", campaign.name);
                while (true) {
                    const matchedItems = rules.map((rule) => {
                        const { quantity, products } = rule;
                        return sortedCart.find(
                            (item) =>
                                products.includes(item.product!) &&
                                item.quantity >= quantity
                        );
                    });
                    if (matchedItems.some((item) => !item)) {
                        break;
                    }
                    matchedItems.forEach((item, index) => {
                        item!.quantity -= rules[index].quantity;
                    });
                    discountedTotal += amount!;
                }
            }
        }
    });

    // Calculate the total after applying discounts from campaigns
    const prices = await Promise.all(
        sortedCart.map((item) => getCampaignPriceForItem(item))
    );

    const remainingTotal = prices.reduce((sum, price) => sum + price, 0);

    let total = discountedTotal + remainingTotal;

    const fullCampaigns = campaigns.filter((campaign) => {
        return (
            campaign.type === "tab-fixed-amount" ||
            campaign.type === "tab-percentage"
        );
    });

    fullCampaigns.forEach((campaign) => {
        switch (campaign.type) {
            case "tab-fixed-amount":
                if (campaign.amount) {
                    total = total - campaign.amount;
                }
                break;
            case "tab-percentage":
                if (campaign["discount-rate"]) {
                    total =
                        total * (1 - (campaign["discount-rate"] || 0) / 100);
                }
                break;
            default:
                break;
        }
    });

    return total;
}

export const calcTotalWithoutCampaigns = (items: API.Item[]): number => {
    return items.reduce((sum, item) => {
        const itemTotal = (item.price || 0) * (item.quantity || 0);
        return sum + itemTotal;
    }, 0);
};
