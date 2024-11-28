import { IonButton, IonItem, IonLabel, IonNote } from "@ionic/react";
import { useCart, type CartItem } from "../contexts/cartContext";
import { useEffect, useState } from "react";
import { initializeApi } from "../api/config";
import '../styles/components/CartItem.css';

export default function CartItem({ item }: { item: CartItem }) {
    const [product, setProduct] = useState<any>();
    const { dispatch } = useCart();

    useEffect(() => {
        async function fetch() {
            const api = initializeApi();
            const res = await api.getProduct(item.product!);
            setProduct(res);
        }
        fetch();
    }, []);

    const handleIncrement = () => {
        dispatch({
            type: "UPDATE_QUANTITY",
            payload: {
                product: item.product!,
                quantity: item.quantity + 1,
            },
        });
    };

    const handleDecrement = () => {
        if (item.quantity > 1) {
            dispatch({
                type: "UPDATE_QUANTITY",
                payload: {
                    product: item.product!,
                    quantity: item.quantity - 1,
                },
            });
        } else {
            dispatch({ type: "REMOVE_ITEM", payload: item.product! });
        }
    };

    const handleDelete = () => {
        dispatch({ type: "REMOVE_ITEM", payload: item.product! });
    };

    return (
        <IonItem className="cart-item">
            <div className="cart-item__content">
                <div className="cart-item__info">
                    <IonLabel className="cart-item__name">
                        {item["product-name"]} {item.quantity}st
                    </IonLabel>
                    {product && (
                        <IonNote className="cart-item__price">
                            {product.price * item.quantity}kr
                        </IonNote>
                    )}
                </div>
                <div className="cart-item__controls">
                    <IonButton
                        className="quantity-button"
                        size="small"
                        onClick={handleIncrement}
                    >
                        +
                    </IonButton>
                    <IonButton
                        className="quantity-button"
                        size="small"
                        onClick={handleDecrement}
                    >
                        -
                    </IonButton>
                    <IonButton
                        className="delete-button"
                        color="danger"
                        size="small"
                        onClick={handleDelete}
                    >
                        Delete
                    </IonButton>
                </div>
            </div>
        </IonItem>
    );
}