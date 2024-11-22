import React, { createContext, useContext, useEffect, useState } from "react";
import { ButtonMap, Product, ApiContextType } from "../types/buttonTypes";
import { fetchApiData } from "../services/apiService";

const defaultContext: ApiContextType = {
    buttonMaps: [],
    products: {},
    loading: true,
    error: null,
};

export const ApiContext = createContext<ApiContextType>(defaultContext);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [buttonMaps, setButtonMaps] = useState<ButtonMap[]>([]);
    const [products, setProducts] = useState<{ [key: number]: Product }>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const { buttonMaps: maps, products: prods } = await fetchApiData();
                setButtonMaps(maps);
                setProducts(prods);
            } catch (err) {
                setError(
                    err instanceof Error ? err : new Error("An error occurred")
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    return (
        <ApiContext.Provider
            value={{
                buttonMaps,
                products,
                loading,
                error,
            }}
        >
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