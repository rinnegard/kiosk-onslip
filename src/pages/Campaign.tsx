import React, { useEffect, useState } from "react";
import {
    IonPage,
    IonContent,
    IonText,
    IonSpinner,
    IonIcon,
    IonBadge
} from "@ionic/react";
import { motion, AnimatePresence } from "framer-motion";
import { initializeApi } from "../api/config";
import { API } from "@onslip/onslip-360-web-api";
import { ProductCard } from "../components/ProductCard";
import { Header } from "../components/Header";
import { flash, ticketOutline } from "ionicons/icons";
import '../styles/pages/Campaign.css';

interface CampaignBannerProps {
    campaign: API.Campaign;
}

const CampaignBanner: React.FC<CampaignBannerProps> = ({ campaign }) => {
    const getBannerText = () => {
        switch (campaign.type) {
            case "percentage":
                return `${campaign["discount-rate"]}% rabatt på utvalda produkter`;
            case "fixed-amount":
                return `Spara ${campaign.amount}kr på utvalda produkter`;
            case "fixed-price":
                return `Just nu endast ${campaign.amount}kr`;
            case "cheapest-free":
                return "Köp flera - Få den billigaste på köpet!";
            default:
                return campaign.name;
        }
    };

    return (
        <motion.div 
            className="campaign-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="campaign-banner-content">
                <IonIcon icon={ticketOutline} className="campaign-banner-icon" />
                <div className="campaign-banner-text">
                    <h3>{campaign.name}</h3>
                    <p>{getBannerText()}</p>
                </div>
            </div>
        </motion.div>
    );
};

const CampaignSection: React.FC<{
    campaign: API.Campaign;
    products: API.Product[];
    index: number;
}> = ({ campaign, products, index }) => {
    const allCampaignProducts = campaign.rules.flatMap(rule => rule.products);
    const validProducts = allCampaignProducts
        .map(productId => products.find(p => p.id === productId))
        .filter((product): product is API.Product => product !== undefined);

    return (
        <motion.section
            className="campaign-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <CampaignBanner campaign={campaign} />
            
            <div className="campaign-products">
                <div className="campaign-products-header">
                    <IonBadge color="primary">
                        {validProducts.length} produkter
                    </IonBadge>
                </div>
                <div className="product-grid">
                    {validProducts.map((product, productIndex) => (
                        <ProductCard
                            key={product.id}
                            productId={product.id!}
                            index={productIndex}
                        />
                    ))}
                </div>
            </div>
        </motion.section>
    );
};

export default function Campaign() {
    const [campaigns, setCampaigns] = useState<API.Campaign[]>([]);
    const [products, setProducts] = useState<API.Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetch() {
            try {
                const api = initializeApi();
                const [campaignRes, productRes] = await Promise.all([
                    api.listCampaigns(),
                    api.listProducts()
                ]);
                setCampaigns(campaignRes);
                setProducts(productRes);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetch();
    }, []);

    if (loading) {
        return (
            <IonPage>
                <Header />
                <IonContent>
                    <div className="loading-state">
                        <IonSpinner name="crescent" />
                        <p>Laddar kampanjer...</p>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <Header />
            <IonContent>
                <div className="container">
                    <AnimatePresence mode="wait">
                        {campaigns.length === 0 ? (
                            <motion.div
                                className="empty-state-container"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <IonIcon icon={ticketOutline} className="empty-state-icon" />
                                <IonText>
                                    <h2>Inga kampanjer tillgängliga</h2>
                                    <p>Det finns inga aktiva kampanjer just nu.</p>
                                </IonText>
                            </motion.div>
                        ) : (
                            campaigns.map((campaign, index) => (
                                <CampaignSection
                                    key={campaign.id}
                                    campaign={campaign}
                                    products={products}
                                    index={index}
                                />
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </IonContent>
        </IonPage>
    );
}