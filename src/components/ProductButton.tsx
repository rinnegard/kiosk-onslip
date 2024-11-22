import React from 'react';
import { IonButton } from "@ionic/react";
import { ButtonMapItem } from '../types/buttonTypes';
import { useApi } from '../contexts/apiContext';
import { getButtonColor } from '../utils/buttonUtils';

interface ProductButtonProps {
    button: ButtonMapItem;
}

export const ProductButton: React.FC<ProductButtonProps> = ({ button }) => {
    const { products, loading } = useApi();
    const product = button.product ? products[button.product] : null;

    if (loading || !product) {
        return (
            <IonButton 
                expand="block" 
                color={getButtonColor(button.theme)}
                disabled
            >
                Loading...
            </IonButton>
        );
    }

    return (
        <IonButton 
            expand="block"
            color={getButtonColor(button.theme)}
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