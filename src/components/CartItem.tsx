import { IonButton, IonItem, IonIcon, IonLabel, IonNote } from "@ionic/react";
import { add, remove, trash } from "ionicons/icons";
import { useCart, type CartItem } from "../contexts/cartContext";
import { useEffect, useState } from "react";
import { getCampaignPriceForItem } from "../util/getCampaignPrice";
import "../styles/components/CartItem.css";

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
                    <IonLabel className="cart-item__name">
                        {item["product-name"]} {item.quantity} st
                    </IonLabel>
                    <div slot="end">
                        {price && item.price! * item.quantity - price > 0 ? (
                            <div className="cart-item-price-container">
                                <IonNote className="cart-item__price">
                                    {(
                                        (item.price || 0) * item.quantity
                                    ).toFixed(2)}{" "}
                                    kr
                                </IonNote>
                                <IonNote className="reduced-price">
                                    -
                                    {(
                                        item.price! * item.quantity -
                                        price
                                    ).toFixed(2)}{" "}
                                    kr
                                </IonNote>
                            </div>
                        ) : (
                            <IonNote className="cart-item__price">
                                {((item.price || 0) * item.quantity).toFixed(2)}{" "}
                                kr
                            </IonNote>
                        )}
                    </div>
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
                        onClick={() =>
                            dispatch({
                                type: "REMOVE_ITEM",
                                payload: item.product!,
                            })
                        }
                    >
                        <IonIcon icon={trash} />
                    </IonButton>
                </div>
            </div>
        </IonItem>
    );
}
