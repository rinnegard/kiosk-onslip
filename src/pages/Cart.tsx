import React, { useState, useEffect } from "react";
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonButton,
    IonButtons,
    useIonToast,
    IonItem,
    IonLabel,
} from "@ionic/react";
import { useCart } from "../contexts/cartContext";
import { useUsers } from "../contexts/userContext";
import CartItem from "../components/CartItem";
import CartIcon from "../components/CartIcon";
import { UserList } from "../components/UserList";
import { User } from "../types/userTypes";
import { Resource } from "../types/resourceTypes";
import { initializeApi } from "../api/config";
import { fetchResources, createResource } from "../services/resourceService";
import { getRandomDeliveryStaff, logDeliveryAssignment, createDeliveryTags } from "../services/deliveryService";
import { API } from '@onslip/onslip-360-api';

export default function Cart() {
    const [user, setUser] = useState<User>();
    const [resources, setResources] = useState<Resource[]>([]);
    const { state, dispatch } = useCart();
    const { state: { users } } = useUsers();
    const [presentToast] = useIonToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadResources = async () => {
            try {
                const fetchedResources = await fetchResources();
                setResources(fetchedResources);
            } catch (error) {
                console.error("Failed to load resources:", error);
            }
        };
        loadResources();
    }, []);

    const totalAmount = state.items.reduce((sum, item) => 
        sum + (item.price || 0) * item.quantity, 0
    );

    async function handleSendOrder() {
        if (!user || state.items.length === 0) return;

        setIsSubmitting(true);
        try {
            const api = initializeApi();

            // 1. Levereras till plats baserat på användarens namn
        let deliveryResource = resources.find(r => r.name === user.name);
            if (!deliveryResource) {
            deliveryResource = await createResource({
            location: 1,
            name: user.name,    
 });
    setResources([...resources, deliveryResource]);
}

            // 2. Hitta leveranspersonal
            const deliveryStaff = getRandomDeliveryStaff(users, user.id);
            if (!deliveryStaff) {
                throw new Error('Ingen tillgänglig anställd för leverans');
            }   

            // 3. Skapa leveranstags och logga tilldelning
            const deliveryTags = createDeliveryTags(deliveryResource.id!, deliveryStaff.id!);
            logDeliveryAssignment({
                orderName: crypto.randomUUID(),
                customerName: user.name,
                deliveryLocation: deliveryResource.name,
                resourceId: deliveryResource.id!,
                staffId: deliveryStaff.id!
            });

            // 4. Skapa order
            const order = await api.addOrder({
                location: 1,
                state: "requested",
                name: `Leverans till ${user.name}`,
                items: state.items,
                owner: user.id,
                type: "take-out",
                "order-reference": crypto.randomUUID(),
                description: `Leveransplats: ${deliveryResource.name} | Levereras av: ${deliveryStaff.name}`,
                tags: deliveryTags
            });

            // 5. Skapa tab
            const tabItems: API.Item[] = state.items.map(item => ({
                'product': item.product,
                'product-name': item["product-name"],
                'quantity': item.quantity,
                'price': item.price,
                'type': 'goods' as API.ProductGroup.Type,
            }));

            await api.addTab({
                name: `Leverans till ${user.name}`,
                description: `Levereras till: ${deliveryResource.name} | Hämtas och levereras av: ${deliveryStaff.name}`,
                order: order.id,
                items: tabItems,
                tags: deliveryTags
            });

            dispatch({ type: "CLEAR_CART" });
            await presentToast({
                message: `Din beställning är på väg! ${deliveryStaff.name} levererar till din plats.`,
                duration: 3000,
                position: 'bottom',
                color: 'success'
            });

        } catch (error) {
            console.error("Failed to send order:", error);
            await presentToast({
                message: 'Ett fel uppstod när beställningen skulle skickas',
                duration: 3000,
                position: 'bottom',
                color: 'danger'
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Kundvagn</IonTitle>
                    <IonButtons slot="end">
                        <CartIcon />
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                {/* Leveransplats-sektion */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Välj leveransplats</h2>
                    <UserList onUserSelect={setUser} />
                </div>

                {/* Produktlista */}
                <div>
                    {state.items.length > 0 ? (
                        <IonList>
                            {state.items.map((item) => (
                                <CartItem key={item.product} item={item} />
                            ))}
                            
                            {/* Totalsumma */}
                            <IonItem lines="none" className="ion-margin-top font-semibold">
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
                <div>
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
                        disabled={!user || state.items.length === 0 || isSubmitting}
                    >
                        {isSubmitting ? 'Skickar beställning...' : 
                         !user ? 'Välj leveransplats först' :
                         state.items.length === 0 ? 'Lägg till produkter först' :
                         `Skicka beställning till ${user.name}`}
                    </IonButton>
                </div>
            </IonContent>
        </IonPage>
    );
}