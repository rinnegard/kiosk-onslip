export type SystemRole = 'admin' | 'cashier' | 'service' | 'employee';

export interface User {
    id?: number;
    name: string;
    alias: string;
    'system-roles'?: SystemRole[];
    deleted?: string;
}

export interface UserContextType {
    users: User[];
    loading: boolean;
    error: Error | null;
}
