import { IonButton, IonItem, IonLabel, IonNote } from "@ionic/react";
import { useCart, type CartItem } from "../contexts/cartContext";
import { useEffect, useState } from "react";
import { getCampaignPriceForItem } from "../util/getCampaignPrice";

export default function CartItem({ item }: { item: CartItem }) {
    const { dispatch } = useCart();
    const [price, setPrice] = useState<number>();

    useEffect(() => {
        async function fetch() {
            const res = await getCampaignPriceForItem(item);
            setPrice(res);
        }
        fetch();
    }, [item]);

    return (
        <IonItem>
            <IonLabel>
                {item["product-name"]} {item.quantity}st
            </IonLabel>

            <div slot="end">
                {price && item.price! * item.quantity - price > 0 ? (
                    <div>
                        <h3 className="text-end">
                            {((item.price || 0) * item.quantity).toFixed(2)} kr
                        </h3>
                        <h3 className="reduced-price">
                            -{(item.price! * item.quantity - price).toFixed(2)}{" "}
                            kr
                        </h3>
                    </div>
                ) : (
                    <h3 className="text-end">
                        {((item.price || 0) * item.quantity).toFixed(2)} kr
                    </h3>
                )}
            </div>
            <IonButton
                size="small"
                onClick={() => {
                    dispatch({
                        type: "UPDATE_QUANTITY",
                        payload: {
                            product: item.product!,
                            quantity: ++item.quantity,
                        },
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
                        payload: {
                            product: item.product!,
                            quantity: --item.quantity,
                        },
                    });
                }}
            >
                -
            </IonButton>
            <IonButton
                color="danger"
                size="small"
                onClick={() => {
                    dispatch({ type: "REMOVE_ITEM", payload: item.product! });
                }}
            >
                Delete
            </IonButton>
        </IonItem>
    );
}
