import { IonIcon, IonBadge, IonRouterLink } from "@ionic/react";
import { cart } from "ionicons/icons";
import { useCart } from "../contexts/cartContext";

export default function CartIcon() {
    const { state } = useCart();

    return (
        <IonRouterLink className="cart-icon-container" href="/cart">
            <div className="cart-icon-wrapper">
                <IonIcon 
                    icon={cart} 
                    className="cart-icon"
                />
                {state.items.length > 0 && (
                    <IonBadge 
                        color="danger" 
                        className="cart-badge"
                    >
                        {state.items.length}
                    </IonBadge>
                )}
            </div>
        </IonRouterLink>
    );
}