import React from 'react';
import { 
    IonTabBar, 
    IonTabButton, 
    IonIcon, 
    IonLabel 
} from '@ionic/react';
import { 
    iceCreamOutline,    // För glass
    restaurantOutline,  // För lunch/måltid
    beerOutline,        // För dryck
    bagHandleOutline,   // För godis/snacks (bättre ikon än nutrition)
    fastFoodOutline,    // För frukost
    cartOutline         // Fallback ikon
} from 'ionicons/icons';
import { useApi } from '../contexts/apiContext';
import { motion } from 'framer-motion';

const getIconForTab = (name: string): string => {
    const normalizedName = name.toLowerCase();

    // Specifika matchningar för varje kategori
    if (normalizedName.includes('glass')) return iceCreamOutline;
    if (normalizedName.includes('godis') || 
        normalizedName.includes('snacks') || 
        normalizedName.includes('snack')) return bagHandleOutline;
    if (normalizedName.includes('dryck') || 
        normalizedName.includes('läsk') || 
        normalizedName.includes('dricka')) return beerOutline;
    if (normalizedName.includes('frukost') || 
        normalizedName.includes('macka') || 
        normalizedName.includes('smörgås')) return fastFoodOutline;
    if (normalizedName.includes('lunch') || 
        normalizedName.includes('mat') || 
        normalizedName.includes('måltid')) return restaurantOutline;

    // Fallback ikon om ingen matchning hittas
    return cartOutline;
};

export const Footer: React.FC = () => {
    const { state: { buttonMaps } } = useApi();

    const filteredMaps = buttonMaps.filter(
        (map) => map.type === "tablet-buttons" && map.buttons?.length > 0
    );

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <IonTabBar slot="bottom" className="modern-tab-bar">
                {filteredMaps.map((buttonMap) => (
                    <IonTabButton
                        key={buttonMap.id}
                        tab={`tab-${buttonMap.id}`}
                        href={`/tabs/${buttonMap.id}`}
                        className="tab-button"
                    >
                        <IonIcon
                            aria-hidden="true"
                            icon={getIconForTab(buttonMap.name)}
                            className="tab-icon"
                        />
                        <IonLabel className="tab-label">{buttonMap.name}</IonLabel>
                    </IonTabButton>
                ))}
            </IonTabBar>
        </motion.div>
    );
};