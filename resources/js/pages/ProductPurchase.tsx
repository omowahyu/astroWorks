import React, { useState, useMemo, useCallback } from 'react';
import { Head, usePage } from '@inertiajs/react';
import {
    ProductImageGallery,
    ProductInfo,
    ColorSelector,
    SizeSelector,
    QuantitySelector,
    AccessorySelector,
    OrderButton,
    type ProductPurchasePageProps,
    type SelectedMiscOptions,
    type SelectedAccessories,
    type MiscOptionGroups,
    type UnitType,
    type ProductMiscOption
} from '@/components/product';

/**
 * ProductPurchase Page Component
 *
 * Main product detail page with refactored components following React best practices.
 * Integrates with database and provides WhatsApp ordering functionality.
 */
export default function ProductPurchase() {
    const { product, accessories } = usePage<ProductPurchasePageProps>().props;

    // State management with proper TypeScript types
    const [selectedMiscOptions, setSelectedMiscOptions] = useState<SelectedMiscOptions>(() => {
        const defaults: SelectedMiscOptions = {};
        product.misc_options.forEach((option: ProductMiscOption) => {
            if (option.is_default) {
                defaults[option.label] = option.value;
            }
        });
        return defaults;
    });

    const [selectedUnitType, setSelectedUnitType] = useState<UnitType>(
        product.default_unit || product.unit_types[0]
    );

    const [selectedAccessories, setSelectedAccessories] = useState<SelectedAccessories>({});

    const [quantity, setQuantity] = useState(1);

    // Memoized misc option groups for performance
    const miscOptionGroups = useMemo<MiscOptionGroups>(() => {
        return product.misc_options.reduce((groups: MiscOptionGroups, option: ProductMiscOption) => {
            if (!groups[option.label]) {
                groups[option.label] = [];
            }
            groups[option.label].push(option);
            return groups;
        }, {});
    }, [product.misc_options]);

    // Event handlers with useCallback for performance
    const handleMiscOptionChange = useCallback((label: string, value: string) => {
        setSelectedMiscOptions(prev => ({ ...prev, [label]: value }));
    }, []);

    const handleColorChange = useCallback((color: string) => {
        setSelectedMiscOptions(prev => ({ ...prev, 'Tema': color }));
    }, []);

    const handleUnitTypeChange = useCallback((unitType: UnitType) => {
        setSelectedUnitType(unitType);
    }, []);

    const handleAccessoryChange = useCallback((accessoryId: number, quantity: number) => {
        setSelectedAccessories(prev => {
            const newAccessories = { ...prev };
            if (quantity > 0) {
                const accessory = accessories.find(a => a.id === accessoryId);
                if (accessory) {
                    newAccessories[accessoryId] = {
                        quantity,
                        unit_type: accessory.default_unit
                    };
                }
            } else {
                delete newAccessories[accessoryId];
            }
            return newAccessories;
        });
    }, [accessories]);

    // Memoized calculations for performance
    const calculateTotal = useMemo(() => {
        let total = parseFloat(selectedUnitType?.price || '0') * quantity;

        Object.values(selectedAccessories).forEach((accessoryData) => {
            total += parseFloat(accessoryData.unit_type.price) * accessoryData.quantity;
        });

        return total.toString();
    }, [selectedUnitType, quantity, selectedAccessories]);

    // Generate dynamic title based on selected options
    const generateTitle = useMemo(() => {
        let title = product.name;

        // Add selected misc options to title
        Object.entries(selectedMiscOptions).forEach(([label, value]) => {
            if (label.toLowerCase().includes('tema') || label.toLowerCase().includes('warna') || label.toLowerCase().includes('color')) {
                title += ` ${value}`;
            }
        });

        // Add selected unit type to title
        if (selectedUnitType) {
            title += ` ${selectedUnitType.label}`;
        }

        return title;
    }, [product.name, selectedMiscOptions, selectedUnitType]);

    return (
        <>
            <Head title={generateTitle} />

            <div className="min-h-screen bg-white">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 py-8">
                        {/* Product Images */}
                        <ProductImageGallery
                            product={product}
                            className=""
                        />

                        {/* Product Details */}
                        <div className="space-y-6">
                            {/* Product Info */}
                            <ProductInfo
                                product={product}
                                selectedUnitType={selectedUnitType}
                                selectedMiscOptions={selectedMiscOptions}
                                quantity={quantity}
                            />

                            {/* Quantity Selector */}
                            <QuantitySelector
                                quantity={quantity}
                                onQuantityChange={setQuantity}
                                className="flex justify-start"
                            />

                            {/* Color Selection */}
                            <ColorSelector
                                selectedMiscOptions={selectedMiscOptions}
                                onColorChange={handleColorChange}
                            />

                            <div className="space-y-6">
                                {/* Other Misc Options (non-color) */}
                                {Object.entries(miscOptionGroups).map(([label, options]) => {
                                    // Skip color/theme options as they're handled above
                                    if (label.toLowerCase().includes('tema') || label.toLowerCase().includes('warna') || label.toLowerCase().includes('color')) {
                                        return null;
                                    }

                                    return (
                                        <div key={label}>
                                            <h3 className="text-lg font-medium mb-3">{label}</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {options.map((option: ProductMiscOption) => (
                                                    <button
                                                        key={option.id}
                                                        type="button"
                                                        onClick={() => handleMiscOptionChange(label, option.value)}
                                                        className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                                                            selectedMiscOptions[label] === option.value
                                                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        {option.value}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Size Selection */}
                                <SizeSelector
                                    unitTypes={product.unit_types}
                                    selectedUnitType={selectedUnitType}
                                    onSizeChange={handleUnitTypeChange}
                                />

                                {/* Accessories */}
                                <AccessorySelector
                                    accessories={accessories}
                                    selectedAccessories={selectedAccessories}
                                    onAccessoryChange={handleAccessoryChange}
                                />

                                {/* Order Button */}
                                <OrderButton
                                    productTitle={generateTitle}
                                    quantity={quantity}
                                    totalPrice={calculateTotal}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
