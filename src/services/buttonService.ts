import { ButtonMap } from '../types/buttonTypes';
import { API } from '../types/apiTypes';
import { initializeApi } from '../api/config';

export const fetchButtonMaps = async (): Promise<ButtonMap[]> => {
    const api = initializeApi();
    const response = await api.listButtonMaps();
    
    return response.filter((map: API.Stored_ButtonMap) => 
        map.type === 'tablet-buttons' && map.buttons && map.buttons.length > 0
    ) as ButtonMap[];
};