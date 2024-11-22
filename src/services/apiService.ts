import { API } from '@onslip/onslip-360-web-api';
import { ButtonMap, Product } from '../types/buttonTypes';
import { initializeApi } from '../api/config';

export const fetchApiData = async () => {
    const api = initializeApi();
    
    const [buttonMapsResponse, productsResponse] = await Promise.all([
        api.listButtonMaps(),
        api.listProducts()
    ]);

    const tabletButtons = buttonMapsResponse.filter(
        (map: ButtonMap) =>
            map.type === 'tablet-buttons' &&
            map.buttons &&
            map.buttons.length > 0
    );

    const productsMap = productsResponse.reduce((acc, product) => {
        if (product.id) {
            acc[product.id] = product;
        }
        return acc;
    }, {} as { [key: number]: Product });

    return {
        buttonMaps: tabletButtons,
        products: productsMap
    };
};