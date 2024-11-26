// src/pages/TabPage.tsx
import React from "react";
import { useParams } from "react-router-dom";
import {
    IonContent,
    IonPage,
    IonButton,
    IonIcon,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonText,
} from "@ionic/react";
import { refreshOutline } from "ionicons/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../contexts/apiContext";
import { ProductCard } from "../components/ProductCard";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

const TabPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { state: { buttonMaps, products, loading } } = useApi();

    const handleRefresh = (event: CustomEvent) => {
        window.location.reload();
        setTimeout(() => {
            event.detail.complete();
        }, 1500);
    };

    if (loading) {
        return (
            <IonPage className="shop-page">
                <Header />
                <IonContent>
                    <div className="loading-state">
                        <IonSpinner name="crescent" />
                        <p>Laddar produkter...</p>
                    </div>
                </IonContent>
                <Footer />
            </IonPage>
        );
    }

    const buttonMap = buttonMaps.find(map => map.id === parseInt(id));
    
    if (!buttonMap) {
        return (
            <IonPage className="shop-page">
                <Header />
                <IonContent>
                    <div className="error-state">
                        <h2>Kategori hittades inte</h2>
                        <IonButton routerLink="/">
                            Tillbaka till startsidan
                        </IonButton>
                    </div>
                </IonContent>
                <Footer />
            </IonPage>
        );
    }

    const validProducts = buttonMap.buttons
        .filter((button) => button.product && products[button.product])
        .map((button) => ({
            button,
            product: products[button.product!],
        }));

    return (
        <IonPage className="shop-page">
            <Header />
            <IonContent>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent
                        pullingIcon={refreshOutline}
                        pullingText="Dra för att uppdatera"
                        refreshingSpinner="crescent"
                        refreshingText="Uppdaterar..."
                    />
                </IonRefresher>

                <AnimatePresence mode="wait">
                    {validProducts.length === 0 ? (
                        <motion.div className="empty-state">
                            <IonText>
                                <h2>Inga produkter tillgängliga</h2>
                                <p>Det finns inga produkter att visa just nu.</p>
                            </IonText>
                            <IonButton onClick={() => window.location.reload()}>
                                <IonIcon slot="start" icon={refreshOutline} />
                                Försök igen
                            </IonButton>
                        </motion.div>
                    ) : (
                        <motion.div className="product-grid">
                            {validProducts.map(({ button }, index) => (
                                <motion.div
                                    key={`${buttonMap.id}-${button.product}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                        duration: 0.5,
                                        delay: index * 0.1 
                                    }}
                                >
                                    <ProductCard
                                        productId={button.product!}
                                        index={index}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </IonContent>
            <Footer />
        </IonPage>
    );
};

export default TabPage;