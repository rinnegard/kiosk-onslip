import React from "react";
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton } from "@ionic/react";
import { ButtonMapItem, Product } from "../types/buttonTypes";
import { useCart } from "../contexts/cartContext";
import { useApi } from "../contexts/apiContext";

interface ProductCardProps {
    button: ButtonMapItem;
}

export const ProductCard: React.FC<ProductCardProps> = ({ button }) => {
    const { state: { products, loading } } = useApi();
    const product = button.product ? products[button.product] : null;
    const { dispatch } = useCart();

    if (loading || !product) {
        return (
            <IonCard className="h-full flex flex-col animate-pulse">
                <div className="aspect-square w-full bg-gray-200" />
                <IonCardHeader>
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                </IonCardHeader>
                <IonCardContent>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
                    <div className="h-10 bg-gray-200 rounded" />
                </IonCardContent>
            </IonCard>
        );
    }

    const handleAddToCart = () => {
        console.log(product);
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
        <IonCard className="h-full flex flex-col">
            <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                <img
                    src="/api/placeholder/200/200"
                    alt={product.name}
                    className="object-cover w-full h-full"
                />
            </div>
            <IonCardHeader>
                <IonCardTitle className="text-lg font-semibold">
                    {button.name || product.name}
                </IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="flex-grow">
                {product.description && (
                    <p className="text-gray-600 mb-2 text-sm">{product.description}</p>
                )}
                {product.brand && (
                    <p className="text-gray-500 text-sm mb-2">{product.brand}</p>
                )}
                <div className="mt-auto">
                    <div className="flex justify-between items-center mb-2">
                        {product.price ? (
                            <span className="text-xl font-bold">
                                {product.price} kr
                            </span>
                        ) : (
                            <span className="text-gray-500">Pris saknas</span>
                        )}
                        {product.unit && (
                            <span className="text-sm text-gray-500">
                                per {product.unit}
                            </span>
                        )}
                    </div>
                    {product.alert && (
                        <p className="text-amber-600 text-sm mb-2">{product.alert}</p>
                    )}
                    <IonButton 
                        expand="block"
                        onClick={handleAddToCart}
                        disabled={loading || !product.price}
                        className="mt-2"
                    >
                        {loading ? 'Laddar...' : 
                         !product.price ? 'Ej tillgänglig' : 
                         'Lägg till i kundvagn'}
                    </IonButton>
                </div>
            </IonCardContent>
        </IonCard>
    );
};