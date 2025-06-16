/**
 * Product Components Export Index
 * 
 * This file exports all product-related components for easy importing
 * throughout the application.
 */

export { default as ProductImageGallery } from './ProductImageGallery';
export { default as ProductInfo } from './ProductInfo';
export { default as ColorSelector } from './ColorSelector';
export { default as SizeSelector } from './SizeSelector';
export { default as QuantitySelector } from './QuantitySelector';
export { default as AccessorySelector } from './AccessorySelector';
export { default as OrderButton } from './OrderButton';

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
