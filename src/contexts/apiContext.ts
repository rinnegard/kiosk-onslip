import React, { createContext, useContext, useEffect, useState } from "react";
import { API, webRequestHandler } from "@onslip/onslip-360-web-api";

interface ButtonMapItem {
    name?: string;
    theme?: number;
    x: number;
    y: number;
    action: string;
    product?: number;
}

interface ButtonMap {
    name: string;
    type: string;
    buttons: ButtonMapItem[];
    id?: number;
}

interface ApiContextType {
    buttonMaps: ButtonMap[];
    loading: boolean;
    error: Error | null;
}

const defaultContext: ApiContextType = {
    buttonMaps: [],
    loading: true,
    error: null,
};

export const ApiContext = createContext<ApiContextType>(defaultContext);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [buttonMaps, setButtonMaps] = useState<ButtonMap[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                API.initialize(webRequestHandler({}));

                const hawk = import.meta.env.VITE_HAWK_ID;
                const key = import.meta.env.VITE_KEY;
                const realm = import.meta.env.VITE_REALM;

                const api = new API(
                    "https://test.onslip360.com/v1/",
                    realm,
                    hawk,
                    key
                );
                const response = await api.listButtonMaps();

                const tabletButtons = response.filter(
                    (map: ButtonMap) =>
                        map.type === "tablet-buttons" &&
                        map.buttons &&
                        map.buttons.length > 0
                );

                setButtonMaps(tabletButtons);
            } catch (err) {
                setError(
                    err instanceof Error ? err : new Error("An error occurred")
                );
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const contextValue = {
        buttonMaps,
        loading,
        error,
    };

    return React.createElement(
        ApiContext.Provider,
        { value: contextValue },
        children
    );
};

export const useApi = () => {
    const context = useContext(ApiContext);
    if (!context) {
        throw new Error("useApi must be used within an ApiProvider");
    }
    return context;
};
