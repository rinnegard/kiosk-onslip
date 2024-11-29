import { useState, useEffect } from "react";
import {
    IonPage,
    IonContent,
    IonList,
    IonButton,
    useIonToast,
    IonItem,
    IonLabel,
    IonSpinner,
} from "@ionic/react";
import { useCart } from "../contexts/cartContext";
import CartItem from "../components/CartItem";
import { CustomerList } from "../components/UserList";
import { Customer } from "../types/userTypes";
import { Resource } from "../types/resourceTypes";
import { initializeApi } from "../api/config";
import { fetchResources, createResource } from "../services/resourceService";
import {
    getDeliveryStaff,
    createDeliveryTags,
    notifications,
    DeliveryDetails,
} from "../services/deliveryService";
import { API } from "@onslip/onslip-360-api";
import { Header } from "../components/Header";
import { getCampaignPriceForItem } from "../util/getCampaignPrice";
import "../styles/pages/Cart.css";

export default function Cart() {
    const [deliveryLocation, setDeliveryLocation] = useState<Customer>();
    const [resources, setResources] = useState<Resource[]>([]);
    const { state, dispatch } = useCart();
    const [presentToast] = useIonToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [total, setTotal] = useState<number>();

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
            const api = initializeApi();
            const campaigns = await api.listCampaigns();

            const multiItemCampaigns = campaigns.filter((campaign) => {
                return (
                    campaign.rules.length > 1 ||
                    campaign.rules[0].products.length > 1
                );
            });
            console.log(multiItemCampaigns);

            let total = 0;
            for (const item of state.items) {
                const campaignPrice = await getCampaignPriceForItem(item);

                total += campaignPrice || 0;
            }
            setTotal(total);
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
                    <section className="customer-selection">
                        <h2 className="section-title">Välj leveransplats</h2>
                        <CustomerList onCustomerSelect={setDeliveryLocation} />
                    </section>

                    {/* Produktlista */}
                    <section>
                        {state.items.length > 0 ? (
                            <IonList>
                                {state.items.map((item) => (
                                    <CartItem key={item.product} item={item} />
                                ))}

                                {/* Totalsumma */}
                                {total && (
                                    <IonItem
                                        lines="none"
                                        className="ion-margin-top font-semibold"
                                    >
                                        <IonLabel>
                                            <h2 className="text-lg">Totalt</h2>
                                        </IonLabel>
                                        <div
                                            slot="end"
                                            className="cart-total-amount"
                                        >
                                            {total.toFixed(2)} kr
                                        </div>
                                    </IonItem>
                                )}
                            </IonList>
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                <p>Din kundvagn är tom</p>
                            </div>
                        )}
                    </section>

                    {/* Knappar */}
                    <div className="cart-actions">
                        {state.items.length > 0 && (
                            <IonButton
                                expand="block"
                                color="danger"
                                onClick={() => dispatch({ type: "CLEAR_CART" })}
                                disabled={isSubmitting}
                            >
                                Rensa kundvagn
                            </IonButton>
                        )}

                        <IonButton
                            className="order-button"
                            expand="block"
                            color="primary"
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
                            ) : state.items.length === 0 ? (
                                "Lägg till produkter först"
                            ) : (
                                `Skicka beställning till ${deliveryLocation.name}`
                            )}
                        </IonButton>
                    </div>

                    {/* Information om leveransprocess */}
                    {state.items.length > 0 && (
                        <div className="delivery-info">
                            <h3 className="delivery-info-title">
                                Om leveransprocessen:
                            </h3>
                            <ul className="delivery-steps">
                                <li>
                                    Din beställning skickas till vår dedikerade
                                    leveranspersonal
                                </li>
                                <li>
                                    Du får en bekräftelse via e-post när
                                    beställningen mottagits
                                </li>
                                <li>
                                    Efter godkännande får du en ny bekräftelse
                                </li>
                                <li>
                                    Betalning sker på plats vid leverans via
                                    betalterminal
                                </li>
                                <li>
                                    En slutlig orderbekräftelse skickas efter
                                    genomförd betalning
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
}
