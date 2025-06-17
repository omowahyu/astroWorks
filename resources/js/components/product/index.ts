/**
 * Product Components Export Index
 *
 * This file exports all product-related components for easy importing
 * throughout the application.
 */

export { default as ProductImageGallery } from './product-image-gallery';
export { default as ProductInfo } from './product-info';
export { default as ColorSelector } from './color-selector';
export { default as SizeSelector } from './size-selector';
export { default as QuantitySelector } from './quantity-selector';
export { default as AccessorySelector } from './accessory-selector';
export { default as OrderButton } from './order-button';

// Re-export types for convenience
export type {
    Product,
    ProductMiscOption,
    UnitType,
    ProductImage,
    Accessory,
    SelectedAccessory,
    SelectedAccessories,
    SelectedMiscOptions,
    MiscOptionGroups,
    ProductPurchasePageProps,
    ColorTheme
} from '@/types/product';

export { COLOR_THEMES } from '@/types/product';
