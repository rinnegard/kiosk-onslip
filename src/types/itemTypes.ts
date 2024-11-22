export interface ItemModifier {
    labels?: number[];
    modifier: number;
    name: string;
    type?: ModifierType;
    values: string[];
}

export type ModifierType =
    | "single-value"
    | "multiple-values"
    | "single-product"
    | "multiple-products"
    | "products"
    | "single-label"
    | "multiple-labels";

export interface Item {
    product?: number;
    "product-group"?: number;
    campaign?: number;
    "stock-location"?: number;
    "product-name": string;
    "product-name-t9n"?: Translation[];
    description?: string;
    "description-t9n"?: Translation[];
    quantity: number;
    price?: number;
    unit?: string;
    "vat-rate"?: number;
    "vat-amount"?: number;
    type: ProductType;
    "discount-rate"?: number;
    "purchase-price"?: number;
    tickets?: string[];
    "last-kitchen-ticket-item"?: Item;
    comment?: string;
    undiscountable?: boolean;
    "sub-items"?: Item[];
    modifier?: number;
    modifiers?: ItemModifier[];
}

export type Translation = [string, string];

export type SecondaryKitchenPrinterMode = "informative" | "always";

export type ProductType =
    | "goods"
    | "services"
    | "liabilities"
    | "adjustments"
    | "campaigns"
    | "discounts"
    | "discount";

export interface ProductGroup {
    account?: number;
    alert?: string;
    created?: string;
    deleted?: string;
    "discount-account"?: number;
    id?: number;
    "kitchen-printer"?: Function;
    labels?: number[];
    modifiers?: number[];
    name: string;
    "secondary-kitchen-printer-mode"?: SecondaryKitchenPrinterMode;
    "secondary-kitchen-printers"?: Function[];
    tags?: string[];
    type: ProductType;
    undiscountable?: boolean;
    updated?: string;
    "updated-by"?: number;
    "updated-from"?: number;
    "vat-account"?: number;
    "vat-rate": number;
}
