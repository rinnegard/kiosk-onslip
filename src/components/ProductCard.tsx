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
import {
    cartOutline,
    flashOutline,
    checkmarkCircleOutline,
} from "ionicons/icons";
import { useCart } from "../contexts/cartContext";
import { useApi } from "../contexts/apiContext";
import { motion, AnimatePresence } from "framer-motion";
import { initializeApi } from "../api/config";
import { API } from "@onslip/onslip-360-web-api";
import { findBestCampaign } from "../util/findBestCampaign";
import "../styles/components/ProductCard.css";

interface ProductCardProps {
    productId: number;
    index?: number;
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
    const [isAdded, setIsAdded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        async function fetchCampaigns() {
            if (!product?.price) return;

            const api = initializeApi();
            const campaigns = await api.listCampaigns();
            const filteredCampaigns = campaigns.filter((campaign) =>
                campaign.rules.some((rule) => rule.products.includes(productId))
            );

            const bestCampaign = findBestCampaign(
                filteredCampaigns,
                product.price
            );
            if (!bestCampaign) return;

            setCampaign(bestCampaign);
            setCampaignDisplay(
                bestCampaign["discount-rate"] ||
                    bestCampaign.amount ||
                    bestCampaign.name
            );
            switch (bestCampaign.type) {
                case "fixed-amount":
                    setReducedPrice(product.price - bestCampaign.amount!);
                    break;
                case "fixed-price":
                    if (
                        bestCampaign.rules[0].quantity > 1 ||
                        bestCampaign.rules.length > 1
                    ) {
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

        fetchCampaigns();
    }, [productId, product]);

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

        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1500);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index! * 0.1 }}
        >
            <IonCard 
                className="product-card"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <div className="image-container">
                    <IonImg
                        src={product.description}
                        alt={product.name}
                        className="product-image"
                    />
                    {product.price && (
                        <motion.div 
                            className="price-badge"
                            animate={{ scale: isHovered ? 1.05 : 1 }}
                            transition={{ duration: 0.2 }}
                        >
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
                                    <h3 className="price">{product.price.toFixed(2)} kr</h3>
                                )}
                            </IonText>
                        </motion.div>
                    )}
                </div>

                <AnimatePresence>
                    {campaign?.type && campaignDisplay && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="product-card-discount"
                        >
                            {campaign?.type === "percentage"
                                ? `-${campaignDisplay}%`
                                : campaign?.type === "fixed-amount"
                                ? `-${campaignDisplay}kr`
                                : campaignDisplay}
                        </motion.div>
                    )}
                </AnimatePresence>

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

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <IonButton
                                className="add-to-cart-button"
                                expand="block"
                                disabled={loading || !product.price || isAdded}
                                onClick={handleAddToCart}
                                color={isAdded ? "success" : undefined}
                            >
                                <IonIcon
                                    icon={
                                        isAdded
                                            ? checkmarkCircleOutline
                                            : product.price
                                            ? cartOutline
                                            : flashOutline
                                    }
                                    slot="start"
                                />
                                {loading
                                    ? "Laddar..."
                                    : !product.price
                                    ? "Ej tillgänglig"
                                    : isAdded
                                    ? "Tillagd i kundvagn"
                                    : "Lägg till i kundvagn"}
                                <IonRippleEffect />
                            </IonButton>
                        </motion.div>
                    </div>
                </IonCardContent>
            </IonCard>
        </motion.div>
    );
};

export default ProductCard;