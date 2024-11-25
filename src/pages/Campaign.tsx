import {
    IonPage,
    IonContent,
    IonItem,
    IonLabel,
    IonList,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonNote,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { initializeApi } from "../api/config";
import { API } from "@onslip/onslip-360-web-api";
import { ProductCard } from "../components/ProductCard";
import { Header } from "../components/Header";

export default function Campaign() {
    const [campaigns, setCampaigns] = useState<API.Campaign[]>([]);
    const [products, setProducts] = useState<API.Product[]>([]);

    useEffect(() => {
        async function fetch() {
            const api = initializeApi();
            const campaignRes = await api.listCampaigns();
            setCampaigns(campaignRes);

            const productRes = await api.listProducts();
            setProducts(productRes);
        }
        fetch();
    }, []);

    return (
        <IonPage>
            <Header></Header>
            <IonContent>
                {campaigns.length > 0 ? (
                    <IonList>
                        {campaigns.map((campaign) => (
                            <div
                                key={campaign.id}
                                style={{ marginBottom: "2rem" }}
                            >
                                <IonItem>
                                    <IonLabel>
                                        <h2>{campaign.name}</h2>
                                        <p>{campaign.type}</p>
                                    </IonLabel>
                                </IonItem>

                                <IonGrid>
                                    {campaign.rules.map((rule, ruleIndex) => (
                                        <IonRow key={ruleIndex}>
                                            {rule.products.map(
                                                (productId, index) => {
                                                    const product =
                                                        products.find(
                                                            (p) =>
                                                                p.id ===
                                                                productId
                                                        );
                                                    return (
                                                        product && (
                                                            <IonCol
                                                                size="6"
                                                                sizeMd="4"
                                                                sizeLg="2"
                                                                key={index}
                                                            >
                                                                <ProductCard
                                                                    productId={
                                                                        product.id!
                                                                    }
                                                                    index={
                                                                        index
                                                                    }
                                                                />
                                                            </IonCol>
                                                        )
                                                    );
                                                }
                                            )}
                                        </IonRow>
                                    ))}
                                </IonGrid>
                            </div>
                        ))}
                    </IonList>
                ) : (
                    <IonNote>Inga Kampanjer Tillgängliga</IonNote>
                )}
            </IonContent>
        </IonPage>
    );
}
