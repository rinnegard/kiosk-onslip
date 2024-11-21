import { ButtonMap } from '../types/buttonTypes';
import { initializeApi } from '../api/config';

export const fetchButtonMaps = async (): Promise<ButtonMap[]> => {
    const api = initializeApi();
    const response = await api.listButtonMaps();
    
    return response.filter((map: ButtonMap) => 
        map.type === 'tablet-buttons' && map.buttons && map.buttons.length > 0
    );
};

export const getIconForTab = (name: string) => {
    switch (name.toLowerCase()) {
        case 'godis': return 'ice-cream';
        case 'lunch': return 'restaurant';
        case 'läsk': return 'beer';
        default: return 'restaurant';
    }
};