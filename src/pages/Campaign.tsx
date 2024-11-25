import { IonPage, IonContent } from "@ionic/react";
import { Header } from "../components/Header";
import { useEffect, useState } from "react";
import { initializeApi } from "../api/config";
import { API } from "@onslip/onslip-360-web-api";

export default function Campaign() {
    const [campaigns, setCampaigns] = useState<API.Campaign[]>();

    useEffect(() => {
        async function fetch() {
            const api = initializeApi();
            const res = await api.listCampaigns();
            setCampaigns(res);
        }
        fetch();
    }, []);

    return (
        <IonPage>
            <Header />
            <IonContent>
                <pre>{JSON.stringify(campaigns, null, 2)}</pre>
            </IonContent>
        </IonPage>
    );
}
