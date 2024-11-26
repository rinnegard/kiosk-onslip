import React, { useState, useEffect } from 'react';
import { 
    IonPage,
    IonContent,
    IonSpinner,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
} from '@ionic/react';
import { 
    chevronForward,
    pricetag,
} from 'ionicons/icons';
import { useApi } from '../contexts/apiContext';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProductCard } from '../components/ProductCard';
import { initializeApi } from "../api/config";
import { API } from "@onslip/onslip-360-web-api";
import { useHistory } from 'react-router';

interface NewProductsSectionProps {
    products: API.Product[];
}

const NewProductsSection: React.FC<NewProductsSectionProps> = ({ products }) => {
    const newProducts = [...products]
        .sort((a, b) => {
            const dateA = a.created ? new Date(a.created).getTime() : 0;
            const dateB = b.created ? new Date(b.created).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, 6);

    return (
        <section className="product-section">
            <div className="section-header">
                <h2 className="section-title">Senaste Nyheterna</h2>
            </div>
            <div className="product-grid">
                {newProducts.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                        <ProductCard
                            productId={product.id!}
                            index={index}
                        />
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

const CategorySection: React.FC = () => {
    const { state: { buttonMaps } } = useApi();
    const history = useHistory();
    
    const filteredMaps = buttonMaps.filter(
        map => map.type === "tablet-buttons" && map.buttons?.length > 0
    );

    return (
        <section className="category-section">
            <div className="section-header">
                <h2 className="section-title">Kategorier</h2>
            </div>
            <IonGrid>
                <IonRow>
                    {filteredMaps.map((category, index) => (
                        <IonCol key={category.id} size="6" sizeMd="4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <IonCard 
                                    className="category-card"
                                    onClick={() => history.push(`/tabs/${category.id}`)}
                                >
                                    <IonCardContent className="category-content">
                                        <div>
                                            <h3 className="category-title">
                                                {category.name}
                                            </h3>
                                            <p className="category-count">
                                                {category.buttons.length} produkter
                                            </p>
                                        </div>
                                        <IonIcon icon={chevronForward} />
                                    </IonCardContent>
                                </IonCard>
                            </motion.div>
                        </IonCol>
                    ))}
                    <IonCol size="6" sizeMd="4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: filteredMaps.length * 0.1 }}
                        >
                            <IonCard 
                                className="category-card campaign-card"
                                onClick={() => history.push('/campaigns')}
                            >
                                <IonCardContent className="category-content">
                                    <div>
                                        <h3 className="category-title">
                                            Kampanjer
                                        </h3>
                                        <p className="category-count">
                                            Se erbjudanden
                                        </p>
                                    </div>
                                    <IonIcon 
                                        icon={pricetag} 
                                        className="campaign-icon"
                                    />
                                </IonCardContent>
                            </IonCard>
                        </motion.div>
                    </IonCol>
                </IonRow>
            </IonGrid>
        </section>
    );
};

const LandingPage: React.FC = () => {
    const { state: { loading: apiLoading, error } } = useApi();
    const [products, setProducts] = useState<API.Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const api = initializeApi();
                const productRes = await api.listProducts();
                setProducts(productRes);
            } catch (err) {
                console.error('Failed to fetch data:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading || apiLoading) {
        return (
            <IonPage>
                <Header />
                <IonContent>
                    <div className="loading-state">
                        <IonSpinner />
                        <p>Laddar...</p>
                    </div>
                </IonContent>
                <Footer />
            </IonPage>
        );
    }

    if (error) {
        return (
            <IonPage>
                <Header />
                <IonContent>
                    <div className="error-state">
                        <h2>Ett fel uppstod</h2>
                        <p>{error.message}</p>
                        <IonButton onClick={() => window.location.reload()}>
                            Försök igen
                        </IonButton>
                    </div>
                </IonContent>
                <Footer />
            </IonPage>
        );
    }

    return (
        <IonPage>
            <Header />
            <IonContent>
                <div className="container">
                    <CategorySection />
                    <NewProductsSection products={products} />
                </div>
            </IonContent>
            <Footer />
        </IonPage>
    );
};

export default LandingPage;