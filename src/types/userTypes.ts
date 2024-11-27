import { API } from '@onslip/onslip-360-api';

export type SystemRole = 'admin' | 'cashier' | 'service' | 'employee';

// Använd den importerade Customer-typen från API
export type Customer = API.Customer;

export interface CustomerContextType {
    customer: Customer[];
    loading: boolean;
    error: Error | null;
}
