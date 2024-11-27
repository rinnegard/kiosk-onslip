import { useEffect, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import { initializeApi } from "../api/config";
import { API } from "@onslip/onslip-360-web-api";

const Customer: React.FC = () => {
    const [customers, setCustomers] = useState<API.Customer[]>([]);

    useEffect(() => {
        async function fetchCustomers() {
            try {
                const api = initializeApi();
                const customerList = await api.listCustomers();
                setCustomers(customerList);
            } catch (error) {
                console.error("Failed to fetch customers:", error);
            }
        }

        fetchCustomers();
    }, []);

    return (
        <IonPage>
            <IonContent className="ion-padding">
                <h1>Customers</h1>
                {customers.length > 0 ? (
                    <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
                        {JSON.stringify(customers, null, 2)}
                    </pre>
                ) : (
                    <p>Loading customer data...</p>
                )}
            </IonContent>
        </IonPage>
    );
};

export default Customer;
