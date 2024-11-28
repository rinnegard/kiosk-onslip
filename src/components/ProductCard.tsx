import React, { useEffect, useState } from "react";
import {
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonButton,
    IonSkeletonText,
    IonText,
    IonBadge,
    IonIcon,
    IonRippleEffect,
    IonImg,
} from "@ionic/react";
import { cartOutline, flashOutline } from "ionicons/icons";
import { useCart } from "../contexts/cartContext";
import { useApi } from "../contexts/apiContext";
import { motion } from "framer-motion";
import { initializeApi } from "../api/config";
import { API } from "@onslip/onslip-360-web-api";
import { findBestCampaign } from "../util/findBestCampaign";

interface ProductCardProps {
    productId: number;
    index: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    productId,
    index,
}) => {
    const {
        state: { products, loading },
    } = useApi();
    const product = productId ? products[productId] : null;
    const { dispatch } = useCart();
    const [campaignDisplay, setCampaignDisplay] = useState<number | string>();
    const [campaign, setCampaign] = useState<API.Campaign>();
    const [reducedPrice, setReducedPrice] = useState<number>();

    useEffect(() => {
        async function fetch() {
            const api = initializeApi();
            const campaigns = await api.listCampaigns();
            const filteredCampaigns = campaigns.filter((campaign) =>
                campaign.rules.some((rule) => rule.products.includes(productId))
            );

            const bestCampaign = findBestCampaign(
                filteredCampaigns,
                product!.price!
            );

            if (bestCampaign == undefined) {
                return;
            }

            setCampaign(bestCampaign);
            setCampaignDisplay(
                bestCampaign["discount-rate"] ||
                    bestCampaign.amount ||
                    bestCampaign.name
            );
            switch (bestCampaign.type) {
                case "fixed-amount":
                    setReducedPrice(product?.price! - bestCampaign.amount!);
                    break;
                case "fixed-price":
                    if (bestCampaign.rules[0].quantity > 1) {
                        setCampaignDisplay(bestCampaign.name);
                        break;
                    }
                    setReducedPrice(bestCampaign.amount);
                    break;
                case "percentage":
                    setReducedPrice(
                        (1 - bestCampaign["discount-rate"]! / 100) *
                            product?.price!
                    );
                    break;
                default:
                    break;
            }
        }
        fetch();
    }, [productId]);

    if (loading || !product) {
        return (
            <IonCard className="product-card-skeleton">
                <div className="skeleton-image-container">
                    <IonSkeletonText animated className="skeleton-image" />
                </div>
                <IonCardHeader>
                    <IonSkeletonText animated className="skeleton-title" />
                </IonCardHeader>
                <IonCardContent>
                    <IonSkeletonText animated className="skeleton-price" />
                    <IonSkeletonText animated className="skeleton-button" />
                </IonCardContent>
            </IonCard>
        );
    }

    const handleAddToCart = () => {
        dispatch({
            type: "ADD_ITEM",
            payload: {
                "product-name": product.name,
                product: product.id,
                quantity: 1,
                price: product.price,
                type: "goods",
                campaign: campaign?.id,
            },
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <IonCard className="product-card">
                <div className="image-container">
                    <IonImg
                        src={product.description}
                        alt={product.name}
                        className="product-image"
                    />
                    {product.price && (
                        <div className="price-badge">
                            <IonText>
                                {reducedPrice ? (
                                    <div>
                                        <span className="old-price">
                                            {product.price.toFixed(2)} kr
                                        </span>
                                        <h3 className="reduced-price">
                                            {reducedPrice.toFixed(2)} kr
                                        </h3>
                                    </div>
                                ) : (
                                    <h3>{product.price.toFixed(2)} kr</h3>
                                )}
                            </IonText>
                        </div>
                    )}
                </div>
                {campaign?.type === "percentage" && (
                    <div className="product-card-discount">
                        -{campaignDisplay}%
                    </div>
                )}
                {campaign?.type === "fixed-amount" && (
                    <div className="product-card-discount">
                        -{campaignDisplay}kr
                    </div>
                )}
                {campaign?.type === "cheapest-free" && (
                    <div className="product-card-discount">
                        {campaignDisplay}
                    </div>
                )}
                {campaign?.type === "fixed-price" && (
                    <div className="product-card-discount">
                        {campaignDisplay}
                    </div>
                )}

                <IonCardHeader>
                    <IonCardTitle className="product-title">
                        {product.name}
                    </IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                    <div className="product-details">
                        {product.unit && (
                            <IonBadge className="unit-badge">
                                per {product.unit}
                            </IonBadge>
                        )}

                        <IonButton
                            className="add-to-cart-button"
                            expand="block"
                            disabled={loading || !product.price}
                            onClick={handleAddToCart}
                        >
                            <IonIcon
                                icon={
                                    product.price ? cartOutline : flashOutline
                                }
                                slot="start"
                            />
                            {loading
                                ? "Laddar..."
                                : !product.price
                                ? "Ej tillgänglig"
                                : "Lägg till i kundvagn"}
                            <IonRippleEffect />
                        </IonButton>
                    </div>
                </IonCardContent>
            </IonCard>
        </motion.div>
    );
};
