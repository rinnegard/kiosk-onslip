import React from 'react';
import {
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { 
    iceCreamOutline,
    restaurantOutline,
    beerOutline,
    bagHandleOutline,
    fastFoodOutline,
    cartOutline
} from 'ionicons/icons';
import { ButtonMap } from '../types/buttonTypes';

const getIconForTab = (name: string) => {
    const normalizedName = name.toLowerCase();

    switch (true) {
        case normalizedName.includes('glass'):
            return iceCreamOutline;
        case normalizedName.includes('godis') || normalizedName.includes('snacks'):
            return bagHandleOutline;
        case normalizedName.includes('dryck') || normalizedName.includes('läsk'):
            return beerOutline;
        case normalizedName.includes('frukost') || normalizedName.includes('macka'):
            return fastFoodOutline;
        case normalizedName.includes('lunch') || normalizedName.includes('mat'):
            return restaurantOutline;
        default:
            return cartOutline;
    }
};

interface TabBarProps {
    buttonMaps: ButtonMap[];
}

export const TabBar: React.FC<TabBarProps> = ({ buttonMaps }) => {
    const location = useLocation();
    const currentId = location.pathname.split('/').pop();

    const filteredMaps = buttonMaps.filter(map => 
        map.type === 'tablet-buttons' && 
        Array.isArray(map.buttons) && 
        map.buttons.length > 0 && 
        map.id !== undefined
    );

    return (
        <IonTabBar slot="bottom" className="modern-tab-bar">
            {filteredMaps.map((buttonMap) => (
                <IonTabButton
                    key={buttonMap.id}
                    tab={`tab-${buttonMap.id}`}
                    href={`/tabs/${buttonMap.id}`}
                    selected={currentId === buttonMap.id?.toString()}
                    className="tab-button"
                >
                    <IonIcon icon={getIconForTab(buttonMap.name)} />
                    <IonLabel>{buttonMap.name}</IonLabel>
                </IonTabButton>
            ))}
        </IonTabBar>
    );
};

export default TabBar;