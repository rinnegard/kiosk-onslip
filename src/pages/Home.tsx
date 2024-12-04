import React, { useEffect, useState } from "react";
import {
    IonContent,
    IonPage,
    IonButton,
    IonIcon,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonText,
    IonBadge,
    IonToggle,
} from "@ionic/react";
import { refreshOutline, homeOutline } from "ionicons/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useApi } from "../contexts/apiContext";
import { ProductCard } from "../components/ProductCard";
import { Header } from "../components/Header";
import { getIconForTab } from "../components/TabBar";
import "../styles/pages/Home.css";
import { API } from "@onslip/onslip-360-web-api";
import { initializeApi } from "../api/config";
import { ButtonMapItem } from "../types/buttonTypes";

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
                    <IonIcon
                        icon={categoryIcon}
                        className="category-header-icon"
                    />
                    <div className="category-header-text">
                        <div className="category-header-title">
                            <h3>{category.name}</h3>
                            <IonBadge color="primary">
                                {products.length} produkter
                            </IonBadge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="category-products">
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
    const {
        state: { buttonMaps, products, loading },
    } = useApi();
    const [stock, setStock] = useState<API.StockBalance[]>();
    const [filterOutOfStock, setFilterOutOfStock] = useState(false);
    const [categories, setCategories] = useState<
        {
            products: number[];
            id?: number | undefined;
            name: string;
            type:
                | "menu"
                | "tablet-groups"
                | "tablet-buttons"
                | "phone-buttons"
                | "menu-section";
            buttons: ButtonMapItem[];
        }[]
    >();

    useEffect(() => {
        async function fetch() {
            const api = initializeApi();
            const stockData = await api.listStockBalances(1);
            setStock(stockData);
        }
        fetch();
    }, []);

    useEffect(() => {
        if (stock) {
            const filteredCategories = buttonMaps
                .filter(
                    (map) =>
                        map.type === "tablet-buttons" &&
                        map.buttons &&
                        map.buttons.length > 0
                )
                .map((map) => ({
                    ...map,
                    products: map.buttons
                        .filter((button) => button.product)
                        .map((button) => button.product!),
                }))
                .map((category) => ({
                    ...category,
                    products: filterOutOfStock
                        ? category.products.filter((product) =>
                              stock.some(
                                  (item) =>
                                      item.id === product && item.quantity! > 0
                              )
                          )
                        : category.products,
                }));
            setCategories(filteredCategories);
        }
    }, [stock, filterOutOfStock, buttonMaps]);

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

    return (
        <IonPage>
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

                <div className="container">
                    <IonToggle
                        onClick={() => setFilterOutOfStock(!filterOutOfStock)}
                        checked={filterOutOfStock}
                    >
                        Göm Slut
                    </IonToggle>
                    <AnimatePresence mode="sync">
                        {categories?.length === 0 ? (
                            <motion.div
                                className="empty-state-container"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <IonIcon
                                    icon={homeOutline}
                                    className="empty-state-icon"
                                />
                                <IonText>
                                    <h2>Inga produkter tillgängliga</h2>
                                    <p>
                                        Det finns inga produkter att visa just
                                        nu.
                                    </p>
                                </IonText>
                            </motion.div>
                        ) : (
                            categories?.map((category, index) => {
                                if (category.products.length > 0) {
                                    return (
                                        <CategorySection
                                            key={category.id}
                                            category={category}
                                            products={category.products}
                                            index={index}
                                        />
                                    );
                                }
                                return null;
                            })
                        )}
                    </AnimatePresence>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Home;
