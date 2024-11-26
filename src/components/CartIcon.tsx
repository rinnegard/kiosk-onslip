import { IonIcon, IonBadge, IonRouterLink } from "@ionic/react";
import { cart } from "ionicons/icons";
import { useCart } from "../contexts/cartContext";

export default function CartIcon() {
    const { state } = useCart();

    const cartSize = state.items.reduce((sum, item) => {
        return sum + item.quantity;
    }, 0);

    return (
        <IonRouterLink className="cart-icon-container" href="/cart">
            <div className="cart-icon-wrapper">
                <IonIcon icon={cart} className="cart-icon" />
                {state.items.length > 0 && (
                    <IonBadge color="danger" className="cart-badge">
                        {cartSize}
                    </IonBadge>
                )}
            </div>
        </IonRouterLink>
    );
}
