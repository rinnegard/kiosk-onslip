import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserContextType } from '../types/userTypes';
import { fetchUsers } from '../services/userService';

const defaultContext: UserContextType = {
    users: [],
    loading: true,
    error: null
};

export const UserContext = createContext<UserContextType>(defaultContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const response = await fetchUsers();
                setUsers(response);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Fel vid hämtning utav användare'));
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    return React.createElement(
        UserContext.Provider,
        { value: { users, loading, error } },
        children
    );
};

export const useUsers = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUsers måste användas inom en UserProvider');
    }
    return context;
};
