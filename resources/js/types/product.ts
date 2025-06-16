/**
 * Product-related TypeScript interfaces and types
 * 
 * This file contains all the type definitions for product-related data structures
 * used throughout the application.
 */

/**
 * Represents a product miscellaneous option (e.g., color, theme)
 */
export interface ProductMiscOption {
    /** Unique identifier for the misc option */
    id: number;
    /** Label/category of the option (e.g., "Tema", "Warna") */
    label: string;
    /** Value of the option (e.g., "Hitam", "Putih") */
    value: string;
    /** Whether this is the default option for its label */
    is_default: boolean;
}

/**
 * Represents a unit type/size option for a product
 */
export interface UnitType {
    /** Unique identifier for the unit type */
    id: number;
    /** Display label for the unit (e.g., "2x3m", "2.4x2.7m") */
    label: string;
    /** Price for this unit type as a string */
    price: string;
    /** Whether this is the default unit type for the product */
    is_default: boolean;
}

/**
 * Represents a product image
 */
export interface ProductImage {
    /** Unique identifier for the image */
    id: number;
    /** Path to the image file */
    image_path: string;
    /** Alternative text for accessibility */
    alt_text?: string;
    /** Whether this is the primary/main image */
    is_primary: boolean;
    /** Sort order for displaying images */
    sort_order: number;
    /** Full URL to the image */
    image_url: string;
}

/**
 * Represents a complete product with all its options and relationships
 */
export interface Product {
    /** Unique identifier for the product */
    id: number;
    /** Product name */
    name: string;
    /** Product description */
    description: string;
    /** All miscellaneous options for this product */
    misc_options: ProductMiscOption[];
    /** All unit types/sizes available for this product */
    unit_types: UnitType[];
    /** Default miscellaneous option */
    default_misc: ProductMiscOption;
    /** Default unit type */
    default_unit: UnitType;
    /** All images for this product */
    images?: ProductImage[];
    /** Primary image for this product */
    primary_image?: ProductImage;
    /** Primary image URL (computed attribute) */
    primary_image_url?: string;
    /** All image URLs (computed attribute) */
    image_urls?: string[];
}

/**
 * Represents an accessory product (simplified version of Product)
 */
export interface Accessory {
    /** Unique identifier for the accessory */
    id: number;
    /** Accessory name */
    name: string;
    /** Default unit type for the accessory */
    default_unit: UnitType;
    /** Default miscellaneous option for the accessory */
    default_misc: ProductMiscOption;
    /** All unit types available for the accessory */
    unit_types: UnitType[];
    /** All miscellaneous options for the accessory */
    misc_options: ProductMiscOption[];
    /** Primary image for the accessory */
    primary_image?: ProductImage;
}

/**
 * Represents selected accessories with quantities
 */
export interface SelectedAccessory {
    /** Quantity selected */
    quantity: number;
    /** Selected unit type */
    unit_type: UnitType;
}

/**
 * Map of accessory IDs to their selected quantities and unit types
 */
export type SelectedAccessories = Record<number, SelectedAccessory>;

/**
 * Map of misc option labels to their selected values
 */
export type SelectedMiscOptions = Record<string, string>;

/**
 * Grouped misc options by label
 */
export type MiscOptionGroups = Record<string, ProductMiscOption[]>;

/**
 * Props for the ProductPurchase page component
 */
export interface ProductPurchasePageProps {
    /** The main product being viewed */
    product: Product;
    /** Available accessories for the product */
    accessories: Accessory[];
    /** Additional props that might be passed from Inertia */
    [key: string]: any;
}

/**
 * Color theme option for the UI
 */
export interface ColorTheme {
    /** Display name of the color */
    name: string;
    /** Hex color code */
    color: string;
}

/**
 * Predefined color themes for the product selector
 */
export const COLOR_THEMES: ColorTheme[] = [
    { name: 'Navy', color: '#1e3a8a' },
    { name: 'Cream', color: '#fef3c7' },
    { name: 'Brown', color: '#92400e' },
    { name: 'Gray', color: '#6b7280' },
    { name: 'Dark Brown', color: '#451a03' }
];
