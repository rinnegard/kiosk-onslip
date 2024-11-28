import React, { useState, useEffect } from 'react';
import { 
    IonPage,
    IonContent,
    IonSpinner,
    IonButton,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardContent,
} from '@ionic/react';
import { useApi } from '../contexts/apiContext';
import { motion } from 'framer-motion';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { initializeApi } from "../api/config";
import { API } from "@onslip/onslip-360-web-api";
import { useHistory } from 'react-router';
import '../styles/pages/LandingPage.css';

interface NewProductsSectionProps {
    products: API.Product[];
}

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
};

const SectionTitle: React.FC<{ title: string }> = ({ title }) => (
    <div className="section-header">
        <h2 className="section-title">{title}</h2>
    </div>
);

const NewProductsSection: React.FC<NewProductsSectionProps> = ({ products }) => {
    const newProducts = [...products]
        .sort((a, b) => {
            const dateA = a.created ? new Date(a.created).getTime() : 0;
            const dateB = b.created ? new Date(b.created).getTime() : 0;
            return dateB - dateA;
        })
        .slice(0, 8);

    return (
        <motion.section 
            className="product-section"
            {...fadeInUp}
        >
            <SectionTitle title="Senaste Nyheterna" />
            <div className="product-grid">
                {newProducts.map((product, index) => (
                    <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <ProductCard
                            productId={product.id!}
                            index={index}
                        />
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
};

const CategorySection: React.FC = () => {
    const { state: { buttonMaps } } = useApi();
    const history = useHistory();
    
    const filteredMaps = buttonMaps.filter(
        map => map.type === "tablet-buttons" && map.buttons?.length > 0
    );

    return (
        <motion.section 
            className="category-section"
            {...fadeInUp}
        >
            <SectionTitle title="Kategorier" />
            <div className="category-grid">
                <IonGrid>
                    <IonRow>
                        {filteredMaps.map((category, index) => (
                            <IonCol key={category.id} size="12" sizeMd="6">
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
                                        </IonCardContent>
                                    </IonCard>
                                </motion.div>
                            </IonCol>
                        ))}
                        <IonCol size="12" sizeMd="6">
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
                                                Se aktuella erbjudanden
                                            </p>
                                        </div>
                                    </IonCardContent>
                                </IonCard>
                            </motion.div>
                        </IonCol>
                    </IonRow>
                </IonGrid>
            </div>
        </motion.section>
    );
};

const LoadingState: React.FC = () => (
    <div className="loading-state">
        <IonSpinner name="crescent" />
        <p>Laddar innehåll...</p>
    </div>
);

const ErrorState: React.FC<{ error: Error }> = ({ error }) => (
    <div className="error-state">
        <h2>Ett fel uppstod</h2>
        <p>{error.message}</p>
        <IonButton 
            onClick={() => window.location.reload()}
            size="large"
        >
            Försök igen
        </IonButton>
    </div>
);

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

    return (
        <IonPage>
            <Header />
            <IonContent>
                {(loading || apiLoading) ? (
                    <LoadingState />
                ) : error ? (
                    <ErrorState error={error} />
                ) : (
                    <div className="container">
                        <CategorySection />
                        <NewProductsSection products={products} />
                    </div>
                )}
            </IonContent>
        </IonPage>
    );
};

export default LandingPage;