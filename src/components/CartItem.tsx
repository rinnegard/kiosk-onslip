import { IonButton, IonItem, IonLabel, IonNote } from "@ionic/react";
import { useCart, type CartItem } from "../contexts/cartContext";
import { useEffect, useState } from "react";
import { initializeApi } from "../api/config";

export default function CartItem({ item }: { item: CartItem }) {
    const [product, setProduct] = useState<any>();
    const { dispatch } = useCart();

    useEffect(() => {
        async function fetch() {
            const api = initializeApi();
            const res = await api.getProduct(item.id);
            setProduct(res);
        }
        fetch();
    });

    return (
        <IonItem>
            <IonLabel>
                {item.name} {item.quantity}st
            </IonLabel>
            {product && <IonNote slot="end">{product.price}kr</IonNote>}
            <IonButton
                size="small"
                onClick={() => {
                    dispatch({
                        type: "UPDATE_QUANTITY",
                        payload: { id: item.id, quantity: ++item.quantity },
                    });
                }}
            >
                +
            </IonButton>
            <IonButton
                size="small"
                onClick={() => {
                    dispatch({
                        type: "UPDATE_QUANTITY",
                        payload: { id: item.id, quantity: --item.quantity },
                    });
                }}
            >
                -
            </IonButton>
            <IonButton
                color="danger"
                size="small"
                onClick={() => {
                    dispatch({ type: "REMOVE_ITEM", payload: item.id });
                }}
            >
                Delete
            </IonButton>
        </IonItem>
    );
}
