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
import { UserList } from "../components/UserList";
import { useState } from "react";
import { User } from "../types/userTypes";
import { initializeApi } from "../api/config";

export default function Cart() {
    const [user, setUser] = useState<User>();
    const { state, dispatch } = useCart();

    async function handleSendOrder() {
        const api = initializeApi();

        const order = await api.addOrder({
            location: 1,
            state: "active",
            name: crypto.randomUUID(),
            items: state.items,
            owner: user!.id,
            type: "take-out",
            "order-reference": crypto.randomUUID(),
        });

        await api.addTab({
            items: state.items,
            order: order.id,
        });
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Tabs</IonTitle>
                    <CartIcon></CartIcon>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <UserList
                    onUserSelect={(user) => {
                        setUser(user);
                    }}
                ></UserList>
                <IonList>
                    {state.items.map((item) => {
                        return (
                            <CartItem key={item.product} item={item}></CartItem>
                        );
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
                <IonButton
                    disabled={user === undefined || state.items.length === 0}
                    onClick={handleSendOrder}
                >
                    Send Order
                </IonButton>
                <pre>{JSON.stringify(state, null, 2)}</pre>
            </IonContent>
        </IonPage>
    );
}
