import { API } from '@onslip/onslip-360-api';

export type SystemRole = 'admin' | 'cashier' | 'service' | 'employee';

// Använd User från API:et
export type User = API.User;

export interface UserContextType {
    users: User[];
    loading: boolean;
    error: Error | null;
}
