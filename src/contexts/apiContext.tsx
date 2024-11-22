import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { ButtonMap, Product } from "../types/buttonTypes";
import { API } from "../types/apiTypes";
import { fetchApiData } from "../services/apiService";

interface ApiState {
    buttonMaps: ButtonMap[];
    products: { [key: number]: Product };
    loading: boolean;
    error: Error | null;
}

type ApiAction = 
    | { type: "FETCH_SUCCESS"; payload: { 
        buttonMaps: API.Stored_ButtonMap[]; 
        products: { [key: number]: API.Stored_Product }; 
    }}
    | { type: "FETCH_ERROR"; payload: Error };

const initialState: ApiState = {
    buttonMaps: [],
    products: {},
    loading: true,
    error: null,
};

const apiReducer = (state: ApiState, action: ApiAction): ApiState => {
    switch (action.type) {
        case "FETCH_SUCCESS":
            return {
                buttonMaps: action.payload.buttonMaps
                    .filter(map => map.type === 'tablet-buttons' && map.buttons?.length > 0) as ButtonMap[],
                products: action.payload.products as { [key: number]: Product },
                loading: false,
                error: null
            };
        case "FETCH_ERROR":
            return {
                ...initialState,
                loading: false,
                error: action.payload
            };
        default:
            return state;
    }
};

const ApiContext = createContext<{
    state: ApiState;
    dispatch: React.Dispatch<ApiAction>;
} | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(apiReducer, initialState);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await fetchApiData();
                dispatch({ 
                    type: "FETCH_SUCCESS", 
                    payload: data
                });
            } catch (err) {
                dispatch({ 
                    type: "FETCH_ERROR", 
                    payload: err instanceof Error ? err : new Error("An error occurred") 
                });
            }
        };

        loadData();
    }, []);

    return (
        <ApiContext.Provider value={{ state, dispatch }}>
            {children}
        </ApiContext.Provider>
    );
};

export const useApi = () => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error("useApi must be used within an ApiProvider");
    }
    return context;
};