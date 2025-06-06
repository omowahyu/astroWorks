import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingCart } from 'lucide-react';

interface ProductMiscOption {
    id: number;
    label: string;
    value: string;
    is_default: boolean;
}

interface UnitType {
    id: number;
    label: string;
    price: string;
    is_default: boolean;
}

interface Product {
    id: number;
    name: string;
    description: string;
    misc_options: ProductMiscOption[];
    unit_types: UnitType[];
    default_misc: ProductMiscOption;
    default_unit: UnitType;
}

interface Accessory {
    id: number;
    name: string;
    default_unit: UnitType;
    default_misc: ProductMiscOption;
    unit_types: UnitType[];
    misc_options: ProductMiscOption[];
}

interface PageProps {
    product: Product;
    accessories: Accessory[];
}

export default function ProductPurchase() {
    const { product, accessories } = usePage<PageProps>().props;
    
    const [selectedMiscOptions, setSelectedMiscOptions] = useState<{[key: string]: string}>(() => {
        const defaults: {[key: string]: string} = {};
        product.misc_options.forEach(option => {
            if (option.is_default) {
                defaults[option.label] = option.value;
            }
        });
        return defaults;
    });
    
    const [selectedUnitType, setSelectedUnitType] = useState<UnitType>(
        product.default_unit || product.unit_types[0]
    );
    
    const [selectedAccessories, setSelectedAccessories] = useState<{[key: number]: {quantity: number, unit_type: UnitType}}>({});
    
    const [quantity, setQuantity] = useState(1);

    const { data, setData, post, processing } = useForm({
        product_id: product.id,
        unit_type_id: selectedUnitType?.id,
        misc_options: selectedMiscOptions,
        accessories: selectedAccessories,
        quantity: quantity,
        price: 0
    });

    // Group misc options by label
    const miscOptionGroups = product.misc_options.reduce((groups: {[key: string]: ProductMiscOption[]}, option) => {
        if (!groups[option.label]) {
            groups[option.label] = [];
        }
        groups[option.label].push(option);
        return groups;
    }, {});

    const handleMiscOptionChange = (label: string, value: string) => {
        const newOptions = { ...selectedMiscOptions, [label]: value };
        setSelectedMiscOptions(newOptions);
        setData('misc_options', newOptions);
    };

    const handleUnitTypeChange = (unitType: UnitType) => {
        setSelectedUnitType(unitType);
        setData('unit_type_id', unitType.id);
    };

    const handleAccessoryChange = (accessoryId: number, quantity: number, unitType: UnitType) => {
        const newAccessories = { ...selectedAccessories };
        if (quantity > 0) {
            newAccessories[accessoryId] = { quantity, unit_type: unitType };
        } else {
            delete newAccessories[accessoryId];
        }
        setSelectedAccessories(newAccessories);
        setData('accessories', newAccessories);
    };

    const calculateTotal = () => {
        let total = parseFloat(selectedUnitType?.price || '0') * quantity;
        
        Object.entries(selectedAccessories).forEach(([accessoryId, accessoryData]) => {
            total += parseFloat(accessoryData.unit_type.price) * accessoryData.quantity;
        });
        
        return total;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const total = calculateTotal();
        setData('price', total);
        post(route('cart.add'));
    };

    const formatPrice = (price: string | number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(typeof price === 'string' ? parseFloat(price) : price);
    };

    return (
        <>
            <Head title={`Beli ${product.name}`} />
            
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Product Image */}
                        <div className="space-y-4">
                            <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-sm">
                                <img
                                    src={`https://picsum.photos/seed/${product.id}/600/600`}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {[1,2,3,4].map((i) => (
                                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-white shadow-sm cursor-pointer hover:opacity-75">
                                        <img
                                            src={`https://picsum.photos/seed/${product.id + i}/150/150`}
                                            alt={`${product.name} view ${i}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                <p className="text-2xl font-semibold text-blue-600">
                                    {formatPrice(selectedUnitType?.price || '0')}
                                </p>
                                {product.description && (
                                    <p className="text-gray-600 mt-4">{product.description}</p>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Misc Options (Colors) */}
                                {Object.entries(miscOptionGroups).map(([label, options]) => (
                                    <div key={label}>
                                        <h3 className="text-lg font-medium mb-3">{label}</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {options.map((option) => (
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
                                ))}

                                {/* Unit Types (Sizes) */}
                                {product.unit_types.length > 1 && (
                                    <div>
                                        <h3 className="text-lg font-medium mb-3">Dinding (Ukuran)</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {product.unit_types.map((unitType) => (
                                                <button
                                                    key={unitType.id}
                                                    type="button"
                                                    onClick={() => handleUnitTypeChange(unitType)}
                                                    className={`p-4 rounded-lg border-2 text-center transition-colors ${
                                                        selectedUnitType?.id === unitType.id
                                                            ? 'border-blue-500 bg-blue-50'
                                                            : 'border-gray-200 bg-white hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="font-medium">{unitType.label}</div>
                                                    <div className="text-sm text-gray-600">{formatPrice(unitType.price)}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Quantity */}
                                <div>
                                    <h3 className="text-lg font-medium mb-3">Jumlah</h3>
                                    <div className="flex items-center space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (quantity > 1) {
                                                    setQuantity(quantity - 1);
                                                    setData('quantity', quantity - 1);
                                                }
                                            }}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-xl font-medium w-12 text-center">{quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setQuantity(quantity + 1);
                                                setData('quantity', quantity + 1);
                                            }}
                                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Accessories */}
                                {accessories.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-medium mb-3">Additional Items</h3>
                                        <div className="space-y-3">
                                            {accessories.map((accessory) => (
                                                <Card key={accessory.id} className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium">{accessory.name}</h4>
                                                            <p className="text-sm text-gray-600">
                                                                {formatPrice(accessory.default_unit?.price || '0')}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const currentQty = selectedAccessories[accessory.id]?.quantity || 0;
                                                                    if (currentQty > 0) {
                                                                        handleAccessoryChange(
                                                                            accessory.id, 
                                                                            currentQty - 1, 
                                                                            accessory.default_unit
                                                                        );
                                                                    }
                                                                }}
                                                                className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-8 text-center text-sm">
                                                                {selectedAccessories[accessory.id]?.quantity || 0}
                                                            </span>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const currentQty = selectedAccessories[accessory.id]?.quantity || 0;
                                                                    handleAccessoryChange(
                                                                        accessory.id, 
                                                                        currentQty + 1, 
                                                                        accessory.default_unit
                                                                    );
                                                                }}
                                                                className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Total & Add to Cart */}
                                <div className="border-t pt-6 space-y-4">
                                    <div className="flex justify-between items-center text-xl font-semibold">
                                        <span>Total:</span>
                                        <span className="text-blue-600">{formatPrice(calculateTotal())}</span>
                                    </div>
                                    
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                                    >
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        {processing ? 'Menambahkan...' : 'Tambah ke Keranjang'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}