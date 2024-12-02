import React from 'react';
import {
    IonContent,
    IonPage,
    IonButton,
    IonIcon,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonText,
    IonBadge
} from '@ionic/react';
import { refreshOutline, homeOutline } from 'ionicons/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useApi } from '../contexts/apiContext';
import { ProductCard } from '../components/ProductCard';
import { Header } from '../components/Header';
import { getIconForTab } from '../components/TabBar';
import '../styles/pages/Home.css';

const CategorySection: React.FC<{
    category: any;
    products: any[];
    index: number;
}> = ({ category, products, index }) => {
    const categoryIcon = getIconForTab(category.name);
    
    return (
        <motion.section
            className="category-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
        >
            <div className="category-header">
                <div className="category-header-content">
                    <IonIcon icon={categoryIcon} className="category-header-icon" />
                    <div className="category-header-text">
                        <h3>{category.name}</h3>
                    </div>
                </div>
            </div>
            
            <div className="category-products">
                <div className="category-products-header">
                    <IonBadge color="primary">
                        {products.length} produkter
                    </IonBadge>
                </div>
                <div className="product-grid">
                    {products.map((productId, productIndex) => (
                        <ProductCard
                            key={productId}
                            productId={productId}
                            index={productIndex}
                        />
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

const Home: React.FC = () => {
    const { state: { buttonMaps, products, loading } } = useApi();

    const handleRefresh = (event: CustomEvent) => {
        window.location.reload();
        setTimeout(() => {
            event.detail.complete();
        }, 1500);
    };

    if (loading) {
        return (
            <IonPage>
                <Header />
                <IonContent>
                    <div className="loading-state">
                        <IonSpinner name="crescent" />
                        <p>Laddar produkter...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    const filteredMaps = buttonMaps
        .filter(map => map.type === 'tablet-buttons' && map.buttons && map.buttons.length > 0)
        .map(map => ({
            ...map,
            products: map.buttons
                .filter(button => button.product)
                .map(button => button.product!)
        }));

    return (
        <IonPage>
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
                    <AnimatePresence mode="sync">
                        {filteredMaps.length === 0 ? (
                            <motion.div 
                                className="empty-state-container"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <IonIcon icon={homeOutline} className="empty-state-icon" />
                                <IonText>
                                    <h2>Inga produkter tillgängliga</h2>
                                    <p>Det finns inga produkter att visa just nu.</p>
                                </IonText>
                            </motion.div>
                        ) : (
                            filteredMaps.map((category, index) => (
                                <CategorySection
                                    key={category.id}
                                    category={category}
                                    products={category.products}
                                    index={index}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Home;