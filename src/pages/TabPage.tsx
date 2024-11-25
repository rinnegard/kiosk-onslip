import React from "react";
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
import { ButtonMap } from "../types/buttonTypes";
import { ProductCard } from "../components/ProductCard";
import { Header } from "../components/Header";
import { refreshOutline } from 'ionicons/icons';
import { motion, AnimatePresence } from 'framer-motion';

interface TabPageProps {
    buttonMap: ButtonMap;
}

const TabPage: React.FC<TabPageProps> = ({ buttonMap }) => {
    const { state: { products, loading } } = useApi();

    const handleRefresh = (event: CustomEvent) => {
        window.location.reload();
        setTimeout(() => {
            event.detail.complete();
        }, 1500);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    if (loading) {
        return (
            <IonPage className="shop-page">
                <Header />
                <IonContent>
                    <div className="loading-container">
                        <IonSpinner 
                            name="crescent"
                            className="loading-spinner"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="loading-text"
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
                <IonRefresher 
                    slot="fixed" 
                    onIonRefresh={handleRefresh}
                    className="custom-refresher"
                >
                    <IonRefresherContent
                        pullingIcon={refreshOutline}
                        pullingText="Dra för att uppdatera"
                        refreshingSpinner="crescent"
                        refreshingText="Uppdaterar..."
                    />
                </IonRefresher>

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
                                    fill="solid"
                                    className="retry-button"
                                >
                                    <IonIcon slot="start" icon={refreshOutline} />
                                    Försök igen
                                </IonButton>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            className="shop-content"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <motion.div 
                                className="product-grid"
                                variants={containerVariants}
                            >
                                {validProducts.map(({ button }, index) => (
                                    <motion.div
                                        key={`${buttonMap.id}-${button.product}`}
                                        variants={itemVariants}
                                        custom={index}
                                    >
                                        <ProductCard
                                            button={button}
                                            index={index}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </IonContent>
        </IonPage>
    );
};

export default TabPage;