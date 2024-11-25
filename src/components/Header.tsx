import React from "react";
import {
    IonHeader,
    IonToolbar,
    IonButtons,
    IonButton,
    IonTabButton,
    IonRouterLink,
} from "@ionic/react";
import CartIcon from "./CartIcon";

interface HeaderProps {
    title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <IonHeader className="ion-no-border modern-header">
            <IonToolbar>
                <div className="header-container">
                    <div className="logo-container">
                        <img
                            src="assets/onslip-brand-full.png"
                            alt="Onslip Logo"
                            className="header-logo"
                        />
                    </div>
                    <IonRouterLink href={`/campaigns`}>Kampanjer</IonRouterLink>
                    <IonButtons slot="end" className="cart-button">
                        <CartIcon />
                    </IonButtons>
                </div>
            </IonToolbar>
        </IonHeader>
    );
};
