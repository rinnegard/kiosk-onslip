import React, {
    createContext,
    useContext,
    useReducer,
    ReactNode,
    useEffect,
} from "react";

export type CartItem = {
    id: number;
    name: string;
    quantity: number;
};

type CartState = {
    items: CartItem[];
};

type CartAction =
    | { type: "ADD_ITEM"; payload: CartItem }
    | { type: "REMOVE_ITEM"; payload: number } // id
    | { type: "UPDATE_QUANTITY"; payload: { id: number; quantity: number } }
    | { type: "CLEAR_CART" };

const initialState: CartState = {
    items: [],
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case "ADD_ITEM": {
            const existingItemIndex = state.items.findIndex(
                (item) => item.id === action.payload.id
            );
            if (existingItemIndex !== -1) {
                const updatedItems = [...state.items];
                updatedItems[existingItemIndex].quantity +=
                    action.payload.quantity;
                return { items: updatedItems };
            }
            return { items: [...state.items, action.payload] };
        }
        case "REMOVE_ITEM":
            return {
                items: state.items.filter((item) => item.id !== action.payload),
            };
        case "UPDATE_QUANTITY":
            if (action.payload.quantity <= 0) {
                return {
                    items: state.items.filter(
                        (item) => item.id !== action.payload.id
                    ),
                };
            }

            return {
                items: state.items.map((item) =>
                    item.id === action.payload.id
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ),
            };
        case "CLEAR_CART":
            return initialState;
        default:
            return state;
    }
};

const CartContext = createContext<{
    state: CartState;
    dispatch: React.Dispatch<CartAction>;
}>({ state: initialState, dispatch: () => undefined });

export const CartProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [state, dispatch] = useReducer(cartReducer, initialState, () => {
        const localData = localStorage.getItem("cart");
        return localData ? JSON.parse(localData) : initialState;
    });

    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(state));
    }, [state]);

    return (
        <CartContext.Provider value={{ state, dispatch }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);