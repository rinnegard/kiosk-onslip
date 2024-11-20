import {
    IonContent,
    IonHeader,
    IonPage,
    IonTitle,
    IonToolbar,
} from "@ionic/react";

import "./Tab1.css";
import { useEffect, useState } from "react";

import { API, webRequestHandler } from "@onslip/onslip-360-web-api";

API.initialize(webRequestHandler({}));

const hawk = import.meta.env.VITE_HAWK_ID;
const key = import.meta.env.VITE_KEY;
const realm = import.meta.env.VITE_REALM;

const api = new API("https://test.onslip360.com/v1/", realm, hawk, key);

const Tab1: React.FC = () => {
    const [data, setData] = useState<any>();

    useEffect(() => {
        const fetchData = async () => {
            const response = await api.listProducts();
            setData(response);
        };

        fetchData();
    }, []);

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Products</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <pre>{JSON.stringify(data, null, 2)}</pre>
            </IonContent>
        </IonPage>
    );
};

export default Tab1;
