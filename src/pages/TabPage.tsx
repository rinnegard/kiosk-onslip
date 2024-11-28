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
import { useApi } from "../contexts/apiContext";
import { ProductCard } from "../components/ProductCard";
import { Header } from "../components/Header";
import { refreshOutline } from 'ionicons/icons';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/pages/TabPage.css';

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
                    <div className="loading-container">
                        <IonSpinner name="crescent" className="loading-spinner" />
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <IonText color="medium">
                                <p>Laddar produkter...</p>
                            </IonText>
                        </motion.div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    const buttonMap = buttonMaps.find(map => map.id === parseInt(id));
    
    if (!buttonMap || !buttonMap.id) {
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
            </IonPage>
        );
    }

    const validProducts = buttonMap.buttons
        .filter(button => {
            const product = button.product ? products[button.product] : null;
            return button.product && product;
        })
        .map(button => ({
            button,
            product: products[button.product!]
        }));

    return (
        <IonPage className="shop-page">
            <Header />
            <IonContent>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh} className="custom-refresher">
                    <IonRefresherContent
                        pullingIcon={refreshOutline}
                        pullingText="Dra för att uppdatera"
                        refreshingSpinner="crescent"
                        refreshingText="Uppdaterar..."
                    />
                </IonRefresher>

                <div className="container">
                    <AnimatePresence mode="wait">
                        {validProducts.length === 0 ? (
                            <motion.div 
                                className="empty-state-container"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="empty-state-content">
                                    <IonText>
                                        <h2>Inga produkter tillgängliga</h2>
                                        <p>Det finns inga produkter att visa just nu.</p>
                                    </IonText>
                                    
                                    <IonButton 
                                        onClick={() => window.location.reload()}
                                        className="retry-button"
                                    >
                                        <IonIcon slot="start" icon={refreshOutline} />
                                        Försök igen
                                    </IonButton>
                                </div>
                            </motion.div>
                        ) : (
                            <section className="product-section">
                                <div className="page-header">
                                    <div className="page-title">
                                        <h1>{buttonMap.name}</h1>
                                    </div>
                                </div>
                                <div className="product-grid">
                                    {validProducts.map(({ button }, index) => (
                                        <motion.div
                                            key={`${buttonMap.id}-${button.product}`}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <ProductCard
                                                productId={button.product!}
                                                index={index}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </AnimatePresence>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default TabPage;