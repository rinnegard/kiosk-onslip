import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonButton,
} from "@ionic/react";
import { useCart } from "../contexts/cartContext";
import CartItem from "../components/CartItem";
import CartIcon from "../components/CartIcon";

export default function Cart() {
    const { state, dispatch } = useCart();

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Tabs</IonTitle>
                    <CartIcon></CartIcon>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonList>
                    {state.items.map((item) => {
                        return <CartItem key={item.id} item={item}></CartItem>;
                    })}
                </IonList>
                <IonButton
                    color={"danger"}
                    onClick={() => {
                        dispatch({ type: "CLEAR_CART" });
                    }}
                >
                    Clear Cart
                </IonButton>
                <pre>{JSON.stringify(state, null, 2)}</pre>
            </IonContent>
        </IonPage>
    );
}
