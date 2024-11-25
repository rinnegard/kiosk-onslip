import { API } from '@onslip/onslip-360-api';

export type SystemRole = 'admin' | 'cashier' | 'service' | 'employee';

// Använd User från API:et
export type Customer = API.Customer

export interface CustomerContextType {
    customer: Customer[];
    loading: boolean;
    error: Error | null;
}
