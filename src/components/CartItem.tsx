import { IonButton, IonItem, IonLabel, IonNote } from "@ionic/react";
import { useCart, type CartItem } from "../contexts/cartContext";
import { useEffect, useState } from "react";
import { initializeApi } from "../api/config";
import { API } from "@onslip/onslip-360-web-api";

export default function CartItem({ item }: { item: CartItem }) {
    const [product, setProduct] = useState<API.Product>();

    const { dispatch } = useCart();

    useEffect(() => {
        async function fetch() {
            const api = initializeApi();
            const res = await api.getProduct(item.product!);
            setProduct(res);
        }
        fetch();
    }, []);

    return (
        <IonItem>
            <IonLabel>
                {item["product-name"]} {item.quantity}st
            </IonLabel>
            {product && (
                <div slot="end">
                    {item.reducedPrice ? (
                        <div>
                            <span className="old-price">
                                {((product.price || 0) * item.quantity).toFixed(
                                    2
                                )}{" "}
                                kr
                            </span>
                            <h3 className="reduced-price">
                                {(item.reducedPrice * item.quantity).toFixed(2)}{" "}
                                kr
                            </h3>
                        </div>
                    ) : (
                        <h3>
                            {((product.price || 0) * item.quantity).toFixed(2)}{" "}
                            kr
                        </h3>
                    )}
                </div>
            )}
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
