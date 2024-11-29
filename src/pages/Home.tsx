import React from 'react';
import {
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
    IonSpinner,
    IonText,
    IonIcon,
    IonButton,
} from '@ionic/react';
import { refreshOutline, homeOutline } from 'ionicons/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../contexts/apiContext';
import { ProductCard } from '../components/ProductCard';
import { Header } from '../components/Header';

const Home: React.FC = () => {
    const { state: { products, buttonMaps, loading } } = useApi();

    const handleRefresh = (event: CustomEvent) => {
        window.location.reload();
        setTimeout(() => {
            event.detail.complete();
        }, 1500);
    };

    // Ta alla unika produkt-ID:n från alla buttonMaps
    const getAllProductIds = () => {
        const productIds = new Set<number>();
        buttonMaps.forEach(map => {
            if (map.buttons) {
                map.buttons.forEach(button => {
                    if (button.product) {
                        productIds.add(button.product);
                    }
                });
            }
        });
        return Array.from(productIds);
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

    const productIds = getAllProductIds();

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
                        {productIds.length === 0 ? (
                            <motion.div 
                                className="empty-state-container"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                <div className="empty-state-content">
                                    <IonIcon
                                        icon={homeOutline}
                                        className="empty-state-icon"
                                    />
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
                            <section className="home-section">
                                <div className="product-grid">
                                    {productIds.map((productId, index) => (
                                        <motion.div
                                            key={productId}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                        >
                                            <ProductCard
                                                productId={productId}
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

export default Home;