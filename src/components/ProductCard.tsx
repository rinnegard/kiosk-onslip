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
import { cartOutline, flashOutline, checkmarkCircleOutline } from "ionicons/icons";
import { useCart } from "../contexts/cartContext";
import { useApi } from "../contexts/apiContext";
import { motion, AnimatePresence } from "framer-motion";
import { initializeApi } from "../api/config";
import { API } from "@onslip/onslip-360-web-api";
import { findBestCampaign } from "../util/findBestCampaign";
import '../styles/components/ProductCard.css';

interface ProductCardProps {
    productId: number;
    index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ productId, index }) => {
    const { state: { products, loading } } = useApi();
    const { state: cartState, dispatch } = useCart();
    const product = productId ? products[productId] : null;
    const [isAdded, setIsAdded] = useState(false);
    const [campaignDetails, setCampaignDetails] = useState<{
        display: number | string;
        type?: API.Campaign.Type;
        reducedPrice?: number | string;
    }>({
        display: '',
    });

    useEffect(() => {
        async function fetchCampaigns() {
            if (!product?.price) return;

            const api = initializeApi();
            const campaigns = await api.listCampaigns();
            const filteredCampaigns = campaigns.filter(campaign =>
                campaign.rules.some(rule => rule.products.includes(productId))
            );

            const bestCampaign = findBestCampaign(filteredCampaigns, product.price);
            if (!bestCampaign) return;

            const display = bestCampaign["discount-rate"] || bestCampaign.amount || bestCampaign.name;
            let reducedPrice;

            switch (bestCampaign.type) {
                case "fixed-amount":
                    reducedPrice = product.price - bestCampaign.amount!;
                    break;
                case "fixed-price":
                    if (bestCampaign.rules[0].quantity > 1) {
                        break;
                    }
                    reducedPrice = bestCampaign.amount;
                    break;
                case "percentage":
                    reducedPrice = ((1 - bestCampaign["discount-rate"]! / 100) * product.price).toFixed(2);
                    break;
            }

            setCampaignDetails({
                display,
                type: bestCampaign.type,
                reducedPrice,
            });
        }

        fetchCampaigns();
    }, [productId, product]);

    const handleAddToCart = () => {
        dispatch({
            type: "ADD_ITEM",
            payload: {
                "product-name": product!.name,
                product: product!.id!,
                quantity: 1,
                price: product!.price,
                type: "goods",
            },
        });
        
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 1500);
    };

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

    const { display, type: campaignType, reducedPrice } = campaignDetails;
    const isInCart = cartState.items.some(item => item.product === product.id);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index! * 0.1 }}
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
                                            {product.price} kr
                                        </span>
                                        <h3 className="reduced-price">
                                            {reducedPrice} kr
                                        </h3>
                                    </div>
                                ) : (
                                    <h3>{product.price} kr</h3>
                                )}
                            </IonText>
                        </div>
                    )}
                </div>

                <AnimatePresence>
                    {campaignType && display && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="product-card-discount"
                        >
                            {campaignType === "percentage" ? `-${display}%` : 
                             campaignType === "fixed-amount" ? `-${display}kr` :
                             display}
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

                        <IonButton
                            className="add-to-cart-button"
                            expand="block"
                            disabled={loading || !product.price || isAdded}
                            onClick={handleAddToCart}
                            color={isAdded ? "success" : "primary"}
                        >
                            <IonIcon
                                icon={isAdded ? checkmarkCircleOutline : (product.price ? cartOutline : flashOutline)}
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
                    </div>
                </IonCardContent>
            </IonCard>
        </motion.div>
    );
};

export default ProductCard;