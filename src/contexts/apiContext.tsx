import React, { createContext, useContext, useReducer, ReactNode, useEffect } from "react";
import { ButtonMap, Product, ApiContextType } from "../types/buttonTypes";
import { fetchApiData } from "../services/apiService";

type ApiState = {
    buttonMaps: ButtonMap[];
    products: { [key: number]: Product };
    loading: boolean;
    error: Error | null;
};

type ApiAction = 
    | { type: "SET_DATA"; payload: { buttonMaps: ButtonMap[], products: { [key: number]: Product } } }
    | { type: "SET_ERROR"; payload: Error }
    | { type: "SET_LOADING"; payload: boolean };

const initialState: ApiState = {
    buttonMaps: [],
    products: {},
    loading: true,
    error: null,
};

const apiReducer = (state: ApiState, action: ApiAction): ApiState => {
    switch (action.type) {
        case "SET_DATA":
            return {
                ...state,
                buttonMaps: action.payload.buttonMaps,
                products: action.payload.products,
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

const ApiContext = createContext<{
    state: ApiState;
    dispatch: React.Dispatch<ApiAction>;
}>({ state: initialState, dispatch: () => undefined });

export const ApiProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(apiReducer, initialState);

    useEffect(() => {
        const loadData = async () => {
            try {
                dispatch({ type: "SET_LOADING", payload: true });
                const { buttonMaps, products } = await fetchApiData();
                dispatch({ 
                    type: "SET_DATA", 
                    payload: { buttonMaps, products } 
                });
            } catch (err) {
                dispatch({ 
                    type: "SET_ERROR", 
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