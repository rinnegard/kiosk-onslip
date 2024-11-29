import { IonButton, IonItem, IonIcon } from "@ionic/react";
import { add, remove, trash } from "ionicons/icons";
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

    return (
        <IonItem className="cart-item">
            <div className="cart-item__content">
                <div className="cart-item__info">
                    <h3 className="cart-item__name">
                        {item["product-name"]} ({item.quantity} st)
                    </h3>
                    {product && (
                        <p className="cart-item__price">
                            {(product.price * item.quantity).toFixed(2)} kr
                        </p>
                    )}
                </div>
                <div className="cart-item__controls">
                    <IonButton
                        className="quantity-button"
                        size="small"
                        onClick={handleDecrement}
                    >
                        <IonIcon icon={remove} />
                    </IonButton>
                    <IonButton
                        className="quantity-button"
                        size="small"
                        onClick={handleIncrement}
                    >
                        <IonIcon icon={add} />
                    </IonButton>
                    <IonButton
                        className="delete-button"
                        color="danger"
                        size="small"
                        onClick={() => dispatch({ type: "REMOVE_ITEM", payload: item.product! })}
                    >
                        <IonIcon icon={trash} />
                    </IonButton>
                </div>
            </div>
        </IonItem>
    );
}