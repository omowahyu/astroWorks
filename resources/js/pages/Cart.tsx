import { useState, useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Minus } from 'lucide-react';

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
}

export default function Cart() {
    const { cart } = usePage<PageProps>().props;
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
</edits>

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
        const phoneNumber = "6281234567890"; // Replace with actual WhatsApp number
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
                            {/* Cart Items */}
                            <div className="space-y-4">
                                {cartItems.map((item, index) => (
                                    <Card key={index} className="p-6">
                                        <div className="flex items-start space-x-4">
                                            <img
                                                src={`https://picsum.photos/seed/${item.product_id}/100/100`}
                                                alt={item.product_name}
                                                className="w-20 h-20 object-cover rounded-lg"
                                            />
                                            
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold">{item.product_name}</h3>
                                                <p className="text-gray-600">Ukuran: {item.unit_type_label}</p>
                                                
                                                {/* Misc Options */}
                                                {Object.entries(item.misc_options).map(([label, value]) => (
                                                    <p key={label} className="text-sm text-gray-600">
                                                        {label}: {value}
                                                    </p>
                                                ))}
                                                
                                                {/* Accessories */}
                                                {Object.keys(item.accessories).length > 0 && (
                                                    <div className="mt-2">
                                                        <p className="text-sm font-medium text-gray-700">Accessories:</p>
                                                        {Object.values(item.accessories).map((acc, accIndex) => (
                                                            <p key={accIndex} className="text-sm text-gray-600">
                                                                • {acc.name} x{acc.quantity} ({formatPrice(parseFloat(acc.unit_type.price))})
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => updateQuantity(index, item.quantity - 1)}
                                                            className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                                                        >
                                                            <Minus className="w-4 h-4" />
                                                        </button>
                                                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(index, item.quantity + 1)}
                                                            className="p-1 rounded border border-gray-300 hover:bg-gray-50"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    
                                                    <div className="flex items-center space-x-4">
                                                        <span className="text-lg font-semibold text-blue-600">
                                                            {formatPrice(item.price)}
                                                        </span>
                                                        <button
                                                            onClick={() => removeItem(index)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                            
                            {/* Total & Checkout */}
                            <Card className="p-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-2xl font-bold">
                                        <span>Total Keseluruhan:</span>
                                        <span className="text-blue-600">{formatPrice(calculateTotal())}</span>
                                    </div>
                                    
                                    <div className="flex space-x-4">
                                        <Button
                                            onClick={() => window.history.back()}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Lanjut Belanja
                                        </Button>
                                        
                                        <Button
                                            onClick={handleWhatsAppOrder}
                                            className="flex-1 bg-green-600 hover:bg-green-700"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.688"/>
                                            </svg>
                                            Pesan via WhatsApp
                                        </Button>
                                    </div>
                                    
                                    <p className="text-sm text-gray-600 text-center">
                                        Dengan menekan "Pesan via WhatsApp", Anda akan diarahkan ke WhatsApp untuk konfirmasi pesanan
                                    </p>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}