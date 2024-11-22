import React from "react";
import { IonButton } from "@ionic/react";
import { ButtonMapItem } from "../types/buttonTypes";
import { useApi } from "../contexts/apiContext";
import { useCart } from "../contexts/cartContext";

interface ProductButtonProps {
    button: ButtonMapItem;
}

export const ProductButton: React.FC<ProductButtonProps> = ({ button }) => {
    const { state: { products, loading } } = useApi();
    const product = button.product ? products[button.product] : null;
    const { dispatch } = useCart();

    if (loading || !product) {
        return (
            <IonButton
                expand="block"
                disabled
            >
                Loading...
            </IonButton>
        );
    }

    return (
        <IonButton
            expand="block"
            onClick={() => {
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
            }}
        >
            <div className="flex flex-col items-start w-full">
                <span>{button.name || product.name}</span>
                {product.price && (
                    <span className="text-sm">{product.price} kr</span>
                )}
            </div>
        </IonButton>
    );
};