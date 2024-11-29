import { useState, useEffect } from "react";
import {
    IonPage,
    IonContent,
    IonList,
    IonButton,
    useIonToast,
    IonIcon,
    IonSpinner,
} from "@ionic/react";
import {
    timeOutline,
    mailOutline,
    cardOutline,
    documentTextOutline,
    cartOutline,
} from "ionicons/icons";
import { useCart } from "../contexts/cartContext";
import CartItem from "../components/CartItem";
import { CustomerList } from "../components/UserList";
import { Header } from "../components/Header";
import { fetchResources, createResource } from "../services/resourceService";
import {
    getDeliveryStaff,
    createDeliveryTags,
    notifications,
    DeliveryDetails,
} from "../services/deliveryService";
import { Customer } from "../types/userTypes";
import { Resource } from "../types/resourceTypes";
import { API } from "@onslip/onslip-360-api";
import { initializeApi } from "../api/config";
import "../styles/pages/Cart.css";
import { calcTotal, calcTotalWithoutCampaigns } from "../util/calcTotal";

export default function Cart() {
    const [deliveryLocation, setDeliveryLocation] = useState<
        Customer | undefined
    >();
    const [resources, setResources] = useState<Resource[]>([]);
    const { state, dispatch } = useCart();
    const [presentToast] = useIonToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [total, setTotal] = useState<number>();
    const [totalDiscount, setTotalDiscount] = useState<number>();

    useEffect(() => {
        const loadResources = async () => {
            try {
                const fetchedResources = await fetchResources();
                setResources(fetchedResources);
            } catch (error) {
                console.error("Fel vid laddning av resurser:", error);
                await presentToast({
                    message: "Kunde inte ladda leveransplatser",
                    duration: 3000,
                    position: "bottom",
                    color: "danger",
                });
            }
        };
        loadResources();
    }, []);

    useEffect(() => {
        const calculateTotal = async () => {
            const total = await calcTotal(state.items);
            const totalWithoutDiscount = calcTotalWithoutCampaigns(state.items);

            setTotal(total);
            setTotalDiscount(totalWithoutDiscount - total);
        };

        calculateTotal();
    }, [state.items]);

    const formatOrderItems = () => {
        return state.items.map(
            (item) =>
                `${item["product-name"]}: ${item.quantity} st - ${(
                    (item.price ?? 0) * item.quantity
                ).toFixed(2)} kr`
        );
    };

    async function handleSendOrder() {
        if (!deliveryLocation || state.items.length === 0) return;

        setIsSubmitting(true);
        try {
            const api = initializeApi();

            const deliveryStaff = await getDeliveryStaff();
            if (!deliveryStaff) {
                throw new Error("Kunde inte hitta leveranspersonal");
            }

            let deliveryResource = resources.find(
                (r) => r.name === deliveryLocation.name
            );
            if (!deliveryResource) {
                deliveryResource = await createResource({
                    location: 1,
                    name: deliveryLocation.name,
                });
                setResources([...resources, deliveryResource]);
            }

            const orderReference = crypto.randomUUID();
            const orderName = `Leverans till ${deliveryLocation.name}`;

            const deliveryTags = createDeliveryTags(deliveryResource.id!);

            const order = await api.addOrder({
                location: 1,
                state: "requested",
                name: orderName,
                items: state.items,
                owner: deliveryLocation.id,
                type: "take-out",
                "order-reference": orderReference,
                description: `Leveransplats: ${deliveryResource.name} | Levereras av: ID 6`,
                tags: deliveryTags,
            });

            const tabItems: API.Item[] = state.items.map((item) => ({
                product: item.product,
                "product-name": item["product-name"],
                quantity: item.quantity,
                price: item.price ?? 0,
                type: "goods" as API.ProductGroup.Type,
            }));

            await api.addTab({
                name: orderName,
                description: `Levereras till: ${deliveryResource.name}`,
                order: order.id,
                items: tabItems,
                tags: deliveryTags,
            });

            const deliveryDetails: DeliveryDetails = {
                orderId: order.id.toString(),
                orderName,
                customerName: deliveryLocation.name,
                customerEmail: deliveryLocation.email!,
                deliveryLocation: deliveryResource.name,
                totalAmount: total!,
                items: formatOrderItems(),
            };

            await Promise.all([
                notifications.sendCustomerOrderConfirmation(deliveryDetails),
                notifications.sendDeliveryStaffNotification(deliveryDetails),
            ]);

            dispatch({ type: "CLEAR_CART" });
            await presentToast({
                message: `Din beställning är mottagen och behandlas nu.`,
                duration: 3000,
                position: "bottom",
                color: "success",
            });
        } catch (error) {
            console.error("Ett fel uppstod:", error);
            await presentToast({
                message: "Ett fel uppstod när beställningen skulle skickas",
                duration: 3000,
                position: "bottom",
                color: "danger",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <IonPage>
            <Header />
            <IonContent>
                <div className="cart-container">
                    {/* Leveransplats-sektion */}
                    <section className="cart-section">
                        <div className="cart-section-header">
                            <h2 className="section-title">
                                Välj leveransplats
                            </h2>
                        </div>
                        <div className="cart-section-content">
                            <CustomerList
                                onCustomerSelect={(customer: Customer) =>
                                    setDeliveryLocation(customer)
                                }
                            />
                        </div>
                    </section>

                    {/* Produktlista */}
                    <section className="cart-section">
                        <div className="cart-section-header">
                            <h2 className="section-title">Din varukorg</h2>
                        </div>
                        <div className="cart-section-content">
                            {state.items.length > 0 ? (
                                <>
                                    <IonList className="cart-list">
                                        {state.items.map((item) => (
                                            <CartItem
                                                key={item.product}
                                                item={item}
                                            />
                                        ))}
                                    </IonList>

                                    <div className="cart-total">
                                        <div className="cart-total-header">
                                            <span className="cart-total-label">
                                                Totalt att betala
                                            </span>
                                            <div className="cart-total-container">
                                                {totalDiscount &&
                                                totalDiscount > 0 ? (
                                                    <span className="cart-total-discount">
                                                        -
                                                        {totalDiscount?.toFixed(
                                                            2
                                                        )}{" "}
                                                        kr
                                                    </span>
                                                ) : null}
                                                <span className="cart-total-amount">
                                                    {total?.toFixed(2)} kr
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="empty-cart">
                                    <IonIcon
                                        icon={cartOutline}
                                        className="empty-cart-icon"
                                    />
                                    <h3 className="empty-cart-text">
                                        Din varukorg är tom
                                    </h3>
                                    <p className="empty-cart-subtext">
                                        Lägg till produkter för att komma igång
                                        med din beställning
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Leveransinformation */}
                    {state.items.length > 0 && (
                        <section className="cart-section">
                            <div className="cart-section-header">
                                <h2 className="section-title">
                                    Om leveransprocessen
                                </h2>
                            </div>
                            <div className="cart-section-content">
                                <ul className="delivery-steps">
                                    <li className="delivery-step">
                                        <IonIcon
                                            icon={timeOutline}
                                            className="step-icon"
                                        />
                                        <span>
                                            Din beställning skickas direkt till
                                            vår dedikerade leveranspersonal
                                        </span>
                                    </li>
                                    <li className="delivery-step">
                                        <IonIcon
                                            icon={mailOutline}
                                            className="step-icon"
                                        />
                                        <span>
                                            Du får en orderbekräftelse via
                                            e-post
                                        </span>
                                    </li>
                                    <li className="delivery-step">
                                        <IonIcon
                                            icon={cardOutline}
                                            className="step-icon"
                                        />
                                        <span>
                                            Betala enkelt med kort vid leverans
                                        </span>
                                    </li>
                                    <li className="delivery-step">
                                        <IonIcon
                                            icon={documentTextOutline}
                                            className="step-icon"
                                        />
                                        <span>
                                            Kvitto skickas till din e-post efter
                                            betalning
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </section>
                    )}

                    {/* Knappar */}
                    {state.items.length > 0 && (
                        <div className="cart-actions">
                            <IonButton
                                expand="block"
                                className="action-button"
                                color="danger"
                                onClick={() => dispatch({ type: "CLEAR_CART" })}
                                disabled={isSubmitting}
                            >
                                Rensa varukorg
                            </IonButton>

                            <IonButton
                                expand="block"
                                className="action-button"
                                onClick={handleSendOrder}
                                disabled={
                                    !deliveryLocation ||
                                    state.items.length === 0 ||
                                    isSubmitting
                                }
                            >
                                {isSubmitting ? (
                                    <div className="loading-spinner">
                                        <IonSpinner name="crescent" />
                                        <span>Skickar beställning...</span>
                                    </div>
                                ) : !deliveryLocation ? (
                                    "Välj leveransplats först"
                                ) : (
                                    `Skicka beställning till ${deliveryLocation.name}`
                                )}
                            </IonButton>
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
}
