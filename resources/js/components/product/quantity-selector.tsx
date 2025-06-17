import React from 'react';
import { Minus, Plus } from 'lucide-react';

/**
 * Props for the QuantitySelector component
 */
interface QuantitySelectorProps {
    /** Current quantity value */
    quantity: number;
    /** Callback when quantity changes */
    onQuantityChange: (quantity: number) => void;
    /** Minimum allowed quantity */
    min?: number;
    /** Maximum allowed quantity */
    max?: number;
    /** Additional CSS classes */
    className?: string;
    /** Size variant of the component */
    size?: 'sm' | 'md' | 'lg';
}

/**
 * QuantitySelector Component
 * 
 * Provides increment/decrement buttons for quantity selection
 * with proper accessibility and validation.
 * 
 * @param props - Component props
 * @returns JSX element containing quantity selector
 */
export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
    quantity,
    onQuantityChange,
    min = 1,
    max = 999,
    className = '',
    size = 'md'
}) => {
    /**
     * Handle quantity increment
     */
    const handleIncrement = (): void => {
        if (quantity < max) {
            onQuantityChange(quantity + 1);
        }
    };

    /**
     * Handle quantity decrement
     */
    const handleDecrement = (): void => {
        if (quantity > min) {
            onQuantityChange(quantity - 1);
        }
    };

    /**
     * Handle direct input change
     */
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && value >= min && value <= max) {
            onQuantityChange(value);
        }
    };

    /**
     * Get size-specific classes
     */
    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    button: 'w-6 h-6 text-xs',
                    icon: 'w-3 h-3',
                    text: 'text-sm w-8',
                    container: 'space-x-2'
                };
            case 'lg':
                return {
                    button: 'w-10 h-10 text-lg',
                    icon: 'w-5 h-5',
                    text: 'text-xl w-12',
                    container: 'space-x-4'
                };
            default: // md
                return {
                    button: 'w-8 h-8',
                    icon: 'w-4 h-4',
                    text: 'text-lg w-10',
                    container: 'space-x-3'
                };
        }
    };

    const sizeClasses = getSizeClasses();

    return (
        <div className={`flex items-center ${sizeClasses.container} ${className}`}>
            {/* Decrement button */}
            <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= min}
                className={`
                    ${sizeClasses.button} rounded-full border border-gray-300 
                    flex items-center justify-center transition-all duration-200
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
                `}
                aria-label="Kurangi jumlah"
                title="Kurangi jumlah"
            >
                <Minus className={sizeClasses.icon} />
            </button>

            {/* Quantity display/input */}
            <div className="relative">
                <input
                    type="number"
                    value={quantity}
                    onChange={handleInputChange}
                    min={min}
                    max={max}
                    className={`
                        ${sizeClasses.text} text-center font-medium border-0 bg-transparent
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
                        [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                    `}
                    aria-label="Jumlah produk"
                />
            </div>

            {/* Increment button */}
            <button
                type="button"
                onClick={handleIncrement}
                disabled={quantity >= max}
                className={`
                    ${sizeClasses.button} rounded-full border border-gray-300 
                    flex items-center justify-center transition-all duration-200
                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white
                `}
                aria-label="Tambah jumlah"
                title="Tambah jumlah"
            >
                <Plus className={sizeClasses.icon} />
            </button>
        </div>
    );
};

export default QuantitySelector;
