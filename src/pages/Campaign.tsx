import { IonPage, IonContent, IonItem, IonLabel, IonList } from "@ionic/react";
import { Header } from "../components/Header";
import { useEffect, useState } from "react";
import { initializeApi } from "../api/config";
import { API } from "@onslip/onslip-360-web-api";
import { ProductCard } from "../components/ProductCard";

export default function Campaign() {
    const [campaigns, setCampaigns] = useState<API.Campaign[]>();
    const [products, setProducts] = useState<API.Product[]>();

    useEffect(() => {
        async function fetch() {
            const api = initializeApi();
            const res = await api.listCampaigns();
            setCampaigns(res);
            const prodRes = await api.listProducts();
            setProducts(prodRes);
        }
        fetch();
    }, []);

    return (
        <IonPage>
            <Header />
            <IonContent>
                {campaigns && products && (
                    <IonList>
                        {campaigns.map((campaign) => (
                            <IonItem key={campaign.id}>
                                <IonLabel>
                                    <h2>{campaign.name}</h2>
                                    <p>Type: {campaign.type}</p>
                                </IonLabel>
                                <IonList>
                                    <IonLabel>Products:</IonLabel>
                                    {campaign.rules.map((rule) => {
                                        return rule.products.map(
                                            (productId, index) => {
                                                const product = products.find(
                                                    (p) => p.id === productId
                                                );
                                                if (product) {
                                                    return (
                                                        <ProductCard
                                                            key={product.id}
                                                            productId={
                                                                product.id!
                                                            }
                                                            index={index}
                                                        ></ProductCard>
                                                    );
                                                }
                                                return null;
                                            }
                                        );
                                    })}
                                </IonList>
                            </IonItem>
                        ))}
                    </IonList>
                )}

                <pre>{JSON.stringify(campaigns, null, 2)}</pre>
            </IonContent>
        </IonPage>
    );
}
