import { API } from "@onslip/onslip-360-web-api";
import { Customer } from '../types/userTypes';

let api: API;

export const initializeUserService = (apiInstance: API) => {
    api = apiInstance;
};

export const fetchCustomer = async (): Promise<Customer[]> => {
    try {
        if (!api) throw new Error('API är inte initialiserat');
        const response = await api.listCustomers();
        return response as unknown as Customer[];
    } catch (error) {
        console.error('Fel vid hämtning av anställda:', error);
        throw error;
    }
};