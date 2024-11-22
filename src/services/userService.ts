import { API } from "@onslip/onslip-360-web-api";
import { User } from '../types/userTypes';

let api: API;

export const initializeUserService = (apiInstance: API) => {
    api = apiInstance;
};

export const fetchUsers = async (): Promise<User[]> => {
    try {
        if (!api) throw new Error('API är inte initialiserat');
        const response = await api.listUsers();
        return response as unknown as User[];
    } catch (error) {
        console.error('Fel vid hämtning av användare:', error);
        throw error;
    }
};