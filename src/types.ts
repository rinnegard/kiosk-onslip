export interface ButtonMapItem {
    name?: string;
    theme?: number;
    x: number;
    y: number;
    action: string;
    product?: number;
}

export interface ButtonMap {
    id?: number;
    name: string;
    type: string;
    buttons: ButtonMapItem[];
}