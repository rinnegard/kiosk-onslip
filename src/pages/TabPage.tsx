import React from "react";
import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
} from "@ionic/react";
import { useCart } from "../contexts/cartContext";
import { ButtonMap } from "../types/buttonTypes";
import { ProductButton } from "../components/ProductButton";

interface TabPageProps {
    buttonMap: ButtonMap;
}

const TabPage: React.FC<TabPageProps> = ({ buttonMap }) => {
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{buttonMap.name}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <div className="ion-padding">
                    {buttonMap.buttons.map((button) => (
                        <ProductButton
                            key={`${button.x}-${button.y}-${button.product}`}
                            button={button}
                        />
                    ))}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default TabPage;
