import React from "react";
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
                                <h3>{product.price} kr</h3>
                            </IonText>
                        </div>
                    )}
                </div>

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
