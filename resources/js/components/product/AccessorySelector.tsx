import React from 'react';
import { Accessory, SelectedAccessories } from '@/types/product';
import QuantitySelector from './QuantitySelector';

/**
 * Props for the AccessorySelector component
 */
interface AccessorySelectorProps {
    /** Available accessories */
    accessories: Accessory[];
    /** Currently selected accessories with quantities */
    selectedAccessories: SelectedAccessories;
    /** Callback when accessory selection changes */
    onAccessoryChange: (accessoryId: number, quantity: number) => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * AccessorySelector Component
 * 
 * Displays available accessories with quantity selectors in a compact layout
 * as specified in the design requirements.
 * 
 * @param props - Component props
 * @returns JSX element containing accessory selection interface
 */
export const AccessorySelector: React.FC<AccessorySelectorProps> = ({
    accessories,
    selectedAccessories,
    onAccessoryChange,
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
     * Get the image URL for an accessory
     */
    const getAccessoryImageUrl = (accessory: Accessory): string => {
        if (accessory.primary_image?.image_url) {
            return accessory.primary_image.image_url;
        }

        // Try to get from storage directory
        const storagePath = `/storage/images/product_${accessory.id}_image_1.jpg`;

        // For now, we'll use the storage path and let the browser handle 404s
        // In a production app, you might want to check if the image exists first
        return storagePath;
    };

    /**
     * Handle quantity change for an accessory
     */
    const handleQuantityChange = (accessoryId: number, quantity: number): void => {
        onAccessoryChange(accessoryId, quantity);
    };

    /**
     * Get current quantity for an accessory
     */
    const getCurrentQuantity = (accessoryId: number): number => {
        return selectedAccessories[accessoryId]?.quantity || 0;
    };

    // Don't render if no accessories
    if (accessories.length === 0) {
        return null;
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <h3 className="text-lg font-medium text-gray-900">Additional Item</h3>
            
            {/* Accessories list */}
            <div className="space-y-3">
                {accessories.map((accessory) => (
                    <div 
                        key={accessory.id} 
                        className="flex items-center justify-between py-2 px-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                        {/* Accessory info */}
                        <div className="flex items-center space-x-3 flex-1">
                            {/* Accessory image */}
                            <div className="flex-shrink-0">
                                <img
                                    src={getAccessoryImageUrl(accessory)}
                                    alt={accessory.name}
                                    className="w-10 h-10 object-cover rounded-md border border-gray-200"
                                    loading="lazy"
                                />
                            </div>
                            
                            {/* Accessory details */}
                            <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm text-gray-900 truncate">
                                    {accessory.name}
                                </h4>
                                <p className="text-xs text-gray-500">
                                    {formatPrice(accessory.default_unit?.price || '0').replace('Rp', '').trim()}
                                </p>
                            </div>
                        </div>

                        {/* Quantity selector */}
                        <div className="flex-shrink-0">
                            <QuantitySelector
                                quantity={getCurrentQuantity(accessory.id)}
                                onQuantityChange={(quantity) => handleQuantityChange(accessory.id, quantity)}
                                min={0}
                                size="sm"
                                className="ml-2"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Selected accessories summary */}
            {Object.keys(selectedAccessories).length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Aksesori Terpilih:
                    </h4>
                    <div className="space-y-1">
                        {Object.entries(selectedAccessories).map(([accessoryId, data]) => {
                            const accessory = accessories.find(a => a.id === parseInt(accessoryId));
                            if (!accessory || data.quantity === 0) return null;
                            
                            return (
                                <div key={accessoryId} className="flex justify-between text-xs text-gray-600">
                                    <span>{accessory.name} × {data.quantity}</span>
                                    <span>
                                        {formatPrice(
                                            parseFloat(data.unit_type.price) * data.quantity
                                        ).replace('Rp', '').trim()}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessorySelector;
