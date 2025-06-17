import React from 'react';
import { Product, UnitType, SelectedMiscOptions } from '@/types/product';

/**
 * Props for the ProductInfo component
 */
interface ProductInfoProps {
    /** The product to display information for */
    product: Product;
    /** Currently selected unit type */
    selectedUnitType: UnitType;
    /** Currently selected misc options */
    selectedMiscOptions: SelectedMiscOptions;
    /** Current quantity */
    quantity: number;
    /** Additional CSS classes */
    className?: string;
}

/**
 * ProductInfo Component
 * 
 * Displays product title, price, and description with dynamic title generation
 * based on selected options.
 * 
 * @param props - Component props
 * @returns JSX element containing product information
 */
export const ProductInfo: React.FC<ProductInfoProps> = ({
    product,
    selectedUnitType,
    selectedMiscOptions,
    quantity,
    className = ''
}) => {
    /**
     * Format price to Indonesian Rupiah currency
     */
    const formatPrice = (price: string | number): string => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(typeof price === 'string' ? parseFloat(price) : price);
    };

    /**
     * Generate dynamic title based on selected options
     */
    const generateTitle = (): string => {
        let title = product.name;

        // Add selected misc options to title
        Object.entries(selectedMiscOptions).forEach(([label, value]) => {
            if (label.toLowerCase().includes('tema') || 
                label.toLowerCase().includes('warna') || 
                label.toLowerCase().includes('color')) {
                title += ` ${value}`;
            }
        });

        // Add selected unit type to title
        if (selectedUnitType) {
            title += ` ${selectedUnitType.label}`;
        }

        return title;
    };

    /**
     * Get the formatted price display
     */
    const getPriceDisplay = (): string => {
        const price = selectedUnitType?.price || '0';
        return formatPrice(price).replace('Rp', '').trim();
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Title and Verification Badge */}
            <div className="flex items-start justify-between">
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {generateTitle()}
                </h1>
                <div className="ml-4 flex-shrink-0">
                    <div 
                        className="w-6 h-6 text-blue-600" 
                        title="Produk Terverifikasi"
                        aria-label="Produk Terverifikasi"
                    >
                        <svg 
                            className="w-full h-full" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline space-x-2">
                <span className="text-sm text-gray-500">Rp</span>
                <span className="text-xl font-semibold text-gray-900">
                    {getPriceDisplay()}
                </span>
                {quantity > 1 && (
                    <span className="text-sm text-gray-500">
                        × {quantity} = Rp {formatPrice(
                            (parseFloat(selectedUnitType?.price || '0') * quantity)
                        ).replace('Rp', '').trim()}
                    </span>
                )}
            </div>

            {/* Description */}
            <div className="pt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                    {product.description || 
                        "Kabinet dapur ukuran 2x3m, Body plywood melamine, Pintu Plywood Soft Close, aksesoris box laci aluminium soft closing, dilengkapi laci 5ml, dad dasd dasdas dasd dasd sadasdasdasd dasdasdasd"
                    }
                </p>
            </div>
        </div>
    );
};

export default ProductInfo;
