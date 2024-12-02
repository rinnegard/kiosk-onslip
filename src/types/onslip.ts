// types/onslip.ts
import { API } from '@onslip/onslip-360-api';

// Core entity types
export type Tab = API.Tab;
export type Item = API.Item;
export type Button = API.Button;
export type Product = API.Product;
export type ButtonMap = API.ButtonMap;
export type ButtonMapItem = API.ButtonMapItem;
export type Payment = API.Payment;

// Stored versions of entities (includes metadata like id, created, updated etc)
export type StoredTab = API.Stored_Tab;
export type StoredButton = API.Stored_Button;
export type StoredProduct = API.Stored_Product;
export type StoredButtonMap = API.Stored_ButtonMap;

// Partial versions for updates
export type PartialTab = API.Partial_Tab;
export type PartialButton = API.Partial_Button;
export type PartialProduct = API.Partial_Product;
export type PartialButtonMap = API.Partial_ButtonMap;

// Common shared types
export type Permission = API.Permission;
export type DateTime = API.DateTime;

// Enums and constants
export const ButtonMapTypes = {
  TABLET_GROUPS: 'tablet-groups',
  TABLET_BUTTONS: 'tablet-buttons',
  PHONE_BUTTONS: 'phone-buttons',
  MENU: 'menu',
  MENU_SECTION: 'menu-section'
} as const;

export type ButtonMapType = typeof ButtonMapTypes[keyof typeof ButtonMapTypes];

// Helper type for consistent error handling
export interface OnslipError {
  code: string;
  message: string;
  details?: unknown;
}

// Helper types for API responses
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  offset: number;
}

// Type guards
export function isStoredProduct(product: Product | StoredProduct): product is StoredProduct {
  return 'id' in product && 'created' in product && 'updated' in product;
}

export function isOnslipError(error: unknown): error is OnslipError {
  return typeof error === 'object' && error !== null && 'code' in error && 'message' in error;
}