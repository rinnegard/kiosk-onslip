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
import { useCustomer } from "../contexts/userContext";
import CartItem from "../components/CartItem";
import { CustomerList } from "../components/UserList";
import { Customer } from "../types/userTypes";
import { Resource } from "../types/resourceTypes";
import { initializeApi } from "../api/config";
import { fetchResources, createResource } from "../services/resourceService";
import {
    getDeliveryStaff,
    logDeliveryAssignment,
    createDeliveryTags,
    notifications,
    DeliveryDetails
} from "../services/deliveryService";
import { paymentService } from "../services/paymentService";
import { API } from "@onslip/onslip-360-api";
import { Header } from "../components/Header";

export default function Cart() {
    const [deliveryLocation, setDeliveryLocation] = useState<Customer>();
    const [resources, setResources] = useState<Resource[]>([]);
    const { state, dispatch } = useCart();
    const [presentToast] = useIonToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Beräkna totalsumma med nullish coalescing
    const totalAmount = state.items.reduce(
        (sum, item) => sum + ((item.price ?? 0) * item.quantity),
        0
    );

    // Formatera orderrader för e-post och loggning
    const formatOrderItems = () => {
        return state.items.map(item => 
            `${item["product-name"]}: ${item.quantity} st - ${((item.price ?? 0) * item.quantity).toFixed(2)} kr`
        );
    };

    async function handleSendOrder() {
        if (!deliveryLocation || state.items.length === 0) return;

        setIsSubmitting(true);
        try {
            const api = initializeApi();

            // Hämta leveranspersonal (ID 6)
            const deliveryStaff = await getDeliveryStaff();
            if (!deliveryStaff) {
                throw new Error("Kunde inte hitta leveranspersonal");
            }

            // Skapa eller hitta leveransresurs
            let deliveryResource = resources.find((r) => r.name === deliveryLocation.name);
            if (!deliveryResource) {
                deliveryResource = await createResource({
                    location: 1,
                    name: deliveryLocation.name,
                });
                setResources([...resources, deliveryResource]);
            }

            const orderReference = crypto.randomUUID();
            const orderName = `Leverans till ${deliveryLocation.name}`;
            
            // Skapa leveranstaggar
            const deliveryTags = createDeliveryTags(deliveryResource.id!);

            // Skapa order
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

            // Skapa tab items
            const tabItems: API.Item[] = state.items.map((item) => ({
                product: item.product,
                "product-name": item["product-name"],
                quantity: item.quantity,
                price: item.price ?? 0,
                type: "goods" as API.ProductGroup.Type,
            }));

            // Skapa tab
            await api.addTab({
                name: orderName,
                description: `Levereras till: ${deliveryResource.name}`,
                order: order.id,
                items: tabItems,
                tags: deliveryTags,
            });

            // Skapa leveransdetaljer
            const deliveryDetails: DeliveryDetails = {
                orderId: order.id.toString(),
                orderName,
                customerName: deliveryLocation.name,
                customerEmail: deliveryLocation.email!,
                deliveryLocation: deliveryResource.name,
                totalAmount,
                items: formatOrderItems()
            };

            // Logga leveranstilldelning
            logDeliveryAssignment(deliveryDetails);

            // Skicka e-postnotifieringar
            await Promise.all([
                // Till kund
                notifications.sendCustomerOrderConfirmation(deliveryDetails),
                // Till leveranspersonal
                notifications.sendDeliveryStaffNotification(deliveryDetails)
            ]);

            // Rensa kundvagn och visa bekräftelse
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
                {/* Leveransplats-sektion */}
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2">
                        Välj leveransplats
                    </h2>
                    <CustomerList onCustomerSelect={setDeliveryLocation} />
                </div>

                {/* Produktlista */}
                <div className="p-4">
                    {state.items.length > 0 ? (
                        <IonList>
                            {state.items.map((item) => (
                                <CartItem key={item.product} item={item} />
                            ))}

                            {/* Totalsumma */}
                            <IonItem
                                lines="none"
                                className="ion-margin-top font-semibold"
                            >
                                <IonLabel>
                                    <h2 className="text-lg">Totalt</h2>
                                </IonLabel>
                                <div slot="end" className="text-lg">
                                    {totalAmount.toFixed(2)} kr
                                </div>
                            </IonItem>
                        </IonList>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <p>Din kundvagn är tom</p>
                        </div>
                    )}
                </div>

                {/* Knappar */}
                <div className="p-4 space-y-4">
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
                            <>
                                <IonSpinner name="crescent" className="mr-2" />
                                Skickar beställning...
                            </>
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
                    <div className="p-4 bg-gray-50 mt-4">
                        <h3 className="text-md font-semibold mb-2">
                            Om leveransprocessen:
                        </h3>
                        <ul className="text-sm space-y-2 text-gray-600">
                            <li>1. Din beställning skickas till vår dedikerade leveranspersonal</li>
                            <li>2. Du får en bekräftelse via e-post när beställningen mottagits</li>
                            <li>3. Efter godkännande får du en ny bekräftelse</li>
                            <li>4. Betalning sker på plats vid leverans via betalterminal</li>
                            <li>5. En slutlig orderbekräftelse skickas efter genomförd betalning</li>
                        </ul>
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
}