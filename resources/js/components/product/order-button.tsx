import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Props for the OrderButton component
 */
interface OrderButtonProps {
    /** Product title for the order message */
    productTitle: string;
    /** Quantity being ordered */
    quantity: number;
    /** Total price for the order */
    totalPrice: string;
    /** WhatsApp phone number (without country code) */
    whatsappNumber?: string;
    /** Additional CSS classes */
    className?: string;
    /** Whether the button is disabled */
    disabled?: boolean;
    /** Loading state */
    loading?: boolean;
}

/**
 * OrderButton Component
 * 
 * Provides WhatsApp ordering functionality as specified in user preferences.
 * Generates a formatted message and opens WhatsApp with the order details.
 * 
 * @param props - Component props
 * @returns JSX element containing the order button
 */
export const OrderButton: React.FC<OrderButtonProps> = ({
    productTitle,
    quantity,
    totalPrice,
    whatsappNumber = '6281234567890', // Default WhatsApp number
    className = '',
    disabled = false,
    loading = false
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
     * Generate WhatsApp order message
     */
    const generateOrderMessage = (): string => {
        const formattedPrice = formatPrice(totalPrice);
        
        return `Halo, saya ingin memesan:

${productTitle}
Jumlah: ${quantity}
Total: ${formattedPrice}

Terima kasih!`;
    };

    /**
     * Handle WhatsApp order
     */
    const handleWhatsAppOrder = (): void => {
        if (disabled || loading) return;

        try {
            const message = generateOrderMessage();
            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
            
            // Open WhatsApp in a new window/tab
            window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        } catch (error) {
            console.error('Error opening WhatsApp:', error);
            // Fallback: copy message to clipboard
            navigator.clipboard?.writeText(generateOrderMessage()).then(() => {
                alert('Pesan telah disalin ke clipboard. Silakan buka WhatsApp secara manual.');
            }).catch(() => {
                alert('Terjadi kesalahan. Silakan hubungi kami secara manual.');
            });
        }
    };

    /**
     * Handle keyboard interaction
     */
    const handleKeyDown = (event: React.KeyboardEvent): void => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleWhatsAppOrder();
        }
    };

    return (
        <div className={`pt-6 space-y-4 ${className}`}>
            <Button
                type="button"
                onClick={handleWhatsAppOrder}
                onKeyDown={handleKeyDown}
                disabled={disabled || loading}
                className={`
                    w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg
                    transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600
                    ${loading ? 'animate-pulse' : ''}
                `}
                aria-label={`Pesan ${productTitle} via WhatsApp`}
            >
                {loading ? (
                    <>
                        <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Memproses...
                    </>
                ) : (
                    <>
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Pesan via WhatsApp
                    </>
                )}
            </Button>

            {/* Order summary */}
            <div className="text-center text-sm text-gray-600">
                <p>
                    Total pesanan: <span className="font-semibold text-gray-900">
                        {formatPrice(totalPrice)}
                    </span>
                </p>
                <p className="mt-1">
                    Klik tombol di atas untuk melanjutkan pemesanan via WhatsApp
                </p>
            </div>
        </div>
    );
};

export default OrderButton;
