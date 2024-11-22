export interface ButtonMapItem {
    name?: string;
    theme?: number;
    x: number;
    y: number;
    action: 'add-product-item' | 'display-button-map' | 'display-parent-button-map' | 
           'display-previous-page' | 'display-next-page' | 'add-tab-discount' | 'open-uri';
    product?: number;
    'button-map'?: number;
    uri?: string;
    'discount-type'?: 'percentage' | 'fixed-amount';
    amount?: number;
    'discount-rate'?: number;
}

export interface ButtonMap {
    id?: number;
    name: string;
    type: 'tablet-groups' | 'tablet-buttons' | 'phone-buttons' | 'menu' | 'menu-section';
    width: number;
    height: number;
    buttons: ButtonMapItem[];
    theme?: 'classic' | 'modern';
    created?: string;
    updated?: string;
    deleted?: string;
    'updated-by'?: number;
    'updated-from'?: number;
    tags?: string[];
    labels?: number[];
}

export interface Product {
    id?: number;
    name: string;
    description?: string;
    price?: number;
    'product-group': number;
    unit?: string;
    sku?: string;
    brand?: string;
}

export interface ApiContextType {
    buttonMaps: ButtonMap[];
    products: { [key: number]: Product };
    loading: boolean;
    error: Error | null;
}

export type ButtonTheme = 
    | 'success'   // Green (0, 5)
    | 'primary'   // Blue (1, 6)
    | 'warning'   // Yellow/Orange (2, 7)
    | 'danger'    // Red (3, 8)
    | 'tertiary'  // Purple (4, 9)
    | 'medium';   // Default gray