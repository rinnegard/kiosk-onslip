import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, UserContextType } from '../types/userTypes';
import { fetchUsers } from '../services/userService';

type UserState = {
    users: User[];
    loading: boolean;
    error: Error | null;
};

type UserAction = 
    | { type: "SET_USERS"; payload: User[] }
    | { type: "SET_ERROR"; payload: Error }
    | { type: "SET_LOADING"; payload: boolean };

const initialState: UserState = {
    users: [],
    loading: true,
    error: null
};

const userReducer = (state: UserState, action: UserAction): UserState => {
    switch (action.type) {
        case "SET_USERS":
            return {
                ...state,
                users: action.payload,
                loading: false,
            };
        case "SET_ERROR":
            return {
                ...state,
                error: action.payload,
                loading: false,
            };
        case "SET_LOADING":
            return {
                ...state,
                loading: action.payload,
            };
        default:
            return state;
    }
};

const UserContext = createContext<{
    state: UserState;
    dispatch: React.Dispatch<UserAction>;
}>({ state: initialState, dispatch: () => undefined });

export const UserProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(userReducer, initialState);

    useEffect(() => {
        const loadUsers = async () => {
            try {
                dispatch({ type: "SET_LOADING", payload: true });
                const users = await fetchUsers();
                dispatch({ type: "SET_USERS", payload: users });
            } catch (err) {
                dispatch({ 
                    type: "SET_ERROR", 
                    payload: err instanceof Error ? err : new Error('Fel vid hämtning utav användare') 
                });
            }
        };

        loadUsers();
    }, []);

    return (
        <UserContext.Provider value={{ state, dispatch }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUsers = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUsers måste användas inom en UserProvider');
    }
    return context;
};