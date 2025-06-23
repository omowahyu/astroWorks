import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';
import DynamicImageSingle from '@/components/image/dynamic-image-single';

interface CartItem {
    product_id: number;
    product_name: string;
    unit_type_id: number;
    unit_type_label: string;
    misc_options: {[key: string]: string};
    accessories: {[key: number]: {quantity: number, unit_type: {id: number, label: string, price: string}, name: string}};
    quantity: number;
    price: number;
    unit_price: number;
}

interface PageProps {
    cart: CartItem[];
    env: {
        WHATSAPP_NUMBER: string;
        BANK_NAME: string;
        BANK_ACCOUNT_NAME: string;
        BANK_ACCOUNT_NUMBER: string;
    };
    [key: string]: any;
}

export default function Cart() {
    const { cart, env } = usePage<PageProps>().props;
    const [cartItems, setCartItems] = useState<CartItem[]>(cart || []);

    useEffect(() => {
        setCartItems(cart || []);
    }, [cart]);

    const updateQuantity = (index: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(index);
            return;
        }

        const updatedCart = [...cartItems];
        updatedCart[index].quantity = newQuantity;
        updatedCart[index].price = updatedCart[index].unit_price * newQuantity;

        // Update accessories total if any
        const accessoriesTotal = Object.values(updatedCart[index].accessories).reduce((total, acc) => {
            return total + (parseFloat(acc.unit_type.price) * acc.quantity);
        }, 0);

        updatedCart[index].price += accessoriesTotal;

        setCartItems(updatedCart);

        // TODO: Update session on backend
        fetch('/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify({ cart: updatedCart })
        });
    };

    const removeItem = (index: number) => {
        const updatedCart = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedCart);

        // TODO: Update session on backend
        fetch('/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
            body: JSON.stringify({ cart: updatedCart })
        });
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.price, 0);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const generateWhatsAppMessage = () => {
        const total = calculateTotal();
        let message = "*PESANAN ASTROWORKS*\n\n";

        cartItems.forEach((item, index) => {
            message += `*${index + 1}. ${item.product_name}*\n`;
            message += `• Ukuran: ${item.unit_type_label}\n`;
            message += `• Jumlah: ${item.quantity}\n`;

            // Add misc options
            Object.entries(item.misc_options).forEach(([label, value]) => {
                message += `• ${label}: ${value}\n`;
            });

            // Add accessories
            Object.values(item.accessories).forEach(acc => {
                message += `• ${acc.name}: ${acc.quantity} unit (${formatPrice(parseFloat(acc.unit_type.price))})\n`;
            });

            message += `• Subtotal: ${formatPrice(item.price)}\n\n`;
        });

        message += `*TOTAL KESELURUHAN: ${formatPrice(total)}*\n\n`;
        message += "Mohon konfirmasi ketersediaan dan waktu pengerjaan. Terima kasih!";

        return encodeURIComponent(message);
    };

    const handleWhatsAppOrder = () => {
        const message = generateWhatsAppMessage();
        const phoneNumber = env.WHATSAPP_NUMBER;
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <>
            <Head title="Keranjang Belanja" />

            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Keranjang Belanja</h1>

                    {cartItems.length === 0 ? (
                        <Card className="p-8 text-center">
                            <CardContent>
                                <div className="text-gray-500 mb-4">
                                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                    </svg>
                                    <p className="text-xl">Keranjang belanja kosong</p>
                                    <p className="text-sm mt-2">Silakan pilih produk terlebih dahulu</p>
                                </div>
                                <Button
                                    onClick={() => window.history.back()}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    Kembali Belanja
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">KERANJANG BELANJA</h2>

                            {/* Cart Items */}
                            <div className="space-y-6">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {index + 1}. {item.product_name.toUpperCase()}
                                        </h3>

                                        {/* Main Product */}
                                        <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-16 h-16 rounded-lg overflow-hidden">
                                                    <DynamicImageSingle
                                                        productId={item.product_id.toString()}
                                                        alt={item.product_name}
                                                        className="w-full h-full"
                                                        mobileRounded="lg"
                                                        desktopRounded="lg"
                                                        useDatabase={true}
                                                        preferThumbnail={true}
                                                        imageType="thumbnail"
                                                        deviceType="auto"
                                                        debug={true}
                                                        productImages={null}
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">{item.product_name}</h4>
                                                    <p className="text-sm text-gray-600">{item.unit_type_label}</p>
                                                    <p className="text-sm font-semibold text-gray-900">
                                                        {formatPrice(item.unit_price)}
                                                    </p>
                                                    {/* Misc Options */}
                                                    {Object.entries(item.misc_options).map(([label, value]) => (
                                                        <p key={label} className="text-xs text-gray-500">
                                                            {label}: {value}
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => updateQuantity(index, item.quantity - 1)}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(index, item.quantity + 1)}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Accessories */}
                                        {Object.keys(item.accessories).length > 0 && (
                                            <div className="space-y-2 ml-4">
                                                {Object.entries(item.accessories).map(([accessoryId, acc]) => (
                                                    <div key={accessoryId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-12 h-12 rounded-lg overflow-hidden">
                                                                <DynamicImageSingle
                                                                    productId={accessoryId}
                                                                    alt={acc.name}
                                                                    className="w-full h-full"
                                                                    mobileRounded="lg"
                                                                    desktopRounded="lg"
                                                                    useDatabase={true}
                                                                    preferThumbnail={true}
                                                                    imageType="thumbnail"
                                                                    deviceType="auto"
                                                                    debug={true}
                                                                    productImages={null}
                                                                />
                                                            </div>
                                                            <div>
                                                                <h5 className="font-medium text-gray-900">{acc.name}</h5>
                                                                <p className="text-sm text-gray-600">{acc.unit_type.label}</p>
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    {formatPrice(parseFloat(acc.unit_type.price))}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-3">
                                                            <button
                                                                onClick={() => {
                                                                    const updatedCart = [...cartItems];
                                                                    const currentQty = updatedCart[index].accessories[parseInt(accessoryId)]?.quantity || 0;
                                                                    if (currentQty > 1) {
                                                                        updatedCart[index].accessories[parseInt(accessoryId)].quantity = currentQty - 1;
                                                                    } else {
                                                                        delete updatedCart[index].accessories[parseInt(accessoryId)];
                                                                    }

                                                                    // Recalculate price
                                                                    const basePrice = updatedCart[index].unit_price * updatedCart[index].quantity;
                                                                    const accessoriesTotal = Object.values(updatedCart[index].accessories).reduce((total, accessory) => {
                                                                        return total + (parseFloat(accessory.unit_type.price) * accessory.quantity);
                                                                    }, 0);
                                                                    updatedCart[index].price = basePrice + accessoriesTotal;

                                                                    setCartItems(updatedCart);
                                                                }}
                                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                                            >
                                                                <Minus className="w-3 h-3" />
                                                            </button>
                                                            <span className="w-8 text-center font-medium text-sm">{acc.quantity}</span>
                                                            <button
                                                                onClick={() => {
                                                                    const updatedCart = [...cartItems];
                                                                    const currentQty = updatedCart[index].accessories[parseInt(accessoryId)]?.quantity || 0;
                                                                    updatedCart[index].accessories[parseInt(accessoryId)].quantity = currentQty + 1;

                                                                    // Recalculate price
                                                                    const basePrice = updatedCart[index].unit_price * updatedCart[index].quantity;
                                                                    const accessoriesTotal = Object.values(updatedCart[index].accessories).reduce((total, accessory) => {
                                                                        return total + (parseFloat(accessory.unit_type.price) * accessory.quantity);
                                                                    }, 0);
                                                                    updatedCart[index].price = basePrice + accessoriesTotal;

                                                                    setCartItems(updatedCart);
                                                                }}
                                                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                                            >
                                                                <Plus className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Total & WhatsApp Order */}
                            <div className="bg-white p-6 rounded-lg border space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-gray-900">TOTAL TAGIHAN</span>
                                    <span className="text-2xl font-bold text-gray-900">
                                        {formatPrice(calculateTotal()).replace('Rp', '').trim()}
                                    </span>
                                </div>

                                <div className="space-y-3 text-sm text-gray-600">
                                    <div>
                                        <p className="font-medium">Transfer</p>
                                        <p>Bank {env.BANK_NAME}</p>
                                        <p>{env.BANK_ACCOUNT_NAME}</p>
                                        <p className="font-mono font-bold text-lg">{env.BANK_ACCOUNT_NUMBER}</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handleWhatsAppOrder}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg rounded-lg"
                                >
                                    <span>Konfirmasi WA</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
