import React from "react";
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButtons,
} from "@ionic/react";
import { useApi } from "../contexts/apiContext";
import { ButtonMap } from "../types/buttonTypes";
import { ProductCard } from "../components/ProductCard";
import CartIcon from "../components/CartIcon";

interface TabPageProps {
    buttonMap: ButtonMap;
}

const TabPage: React.FC<TabPageProps> = ({ buttonMap }) => {
    const { state: { products, loading } } = useApi();

    if (loading) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Laddar...</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <div className="flex items-center justify-center h-full">
                        <p>Laddar produkter...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    const validProducts = buttonMap.buttons
        .filter(button => {
            const product = button.product ? products[button.product] : null;
            return button.product && product;
        })
        .map(button => ({
            button,
            product: products[button.product!]
        }));

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle className="text-lg font-semibold">
                        {buttonMap.name}
                    </IonTitle>
                    <IonButtons slot="end">
                        <CartIcon />
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {validProducts.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Inga produkter tillgängliga</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
    {buttonMap.buttons
        .filter(button => button.product)
        .map((button) => (
            <ProductCard
                key={`${buttonMap.id}-${button.product}`}
                button={button}
            />
        ))}
</div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default TabPage;