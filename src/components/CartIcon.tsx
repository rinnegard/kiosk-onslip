import { IonIcon, IonBadge, IonRouterLink } from "@ionic/react";
import { cart } from "ionicons/icons";
import { useCart } from "../contexts/cartContext";

export default function CartIcon() {
    const { state } = useCart();

    return (
        <>
            <IonRouterLink href="/cart">
                <IonIcon size="large" icon={cart} />
                {state.items.length > 0 && (
                    <IonBadge color="danger">{state.items.length}</IonBadge>
                )}
            </IonRouterLink>
        </>
    );
}
