import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
} from "@ionic/react";
import { useCart } from "../contexts/cartContext";
import CartItem from "../components/CartItem";
import CartIcon from "../components/CartIcon";

export default function Cart() {
    const { state } = useCart();

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

                <pre>{JSON.stringify(state, null, 2)}</pre>
            </IonContent>
        </IonPage>
    );
}
