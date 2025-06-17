import React from 'react';
import { UnitType } from '@/types/product';

/**
 * Props for the SizeSelector component
 */
interface SizeSelectorProps {
    /** Available unit types/sizes */
    unitTypes: UnitType[];
    /** Currently selected unit type */
    selectedUnitType: UnitType;
    /** Callback when a size is selected */
    onSizeChange: (unitType: UnitType) => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * SizeSelector Component
 * 
 * Displays size options using icons without showing prices directly,
 * as specified in the design requirements.
 * 
 * @param props - Component props
 * @returns JSX element containing size selection buttons
 */
export const SizeSelector: React.FC<SizeSelectorProps> = ({
    unitTypes,
    selectedUnitType,
    onSizeChange,
    className = ''
}) => {
    /**
     * Handle size selection
     */
    const handleSizeSelect = (unitType: UnitType): void => {
        onSizeChange(unitType);
    };

    /**
     * Check if a unit type is currently selected
     */
    const isSelected = (unitType: UnitType): boolean => {
        return selectedUnitType?.id === unitType.id;
    };

    /**
     * Get icon for size based on dimensions
     */
    const getSizeIcon = (label: string): string => {
        // Parse dimensions to determine appropriate icon
        const dimensions = label.toLowerCase();
        
        if (dimensions.includes('2x3') || dimensions.includes('2.4x2.7')) {
            return '📐'; // Small/medium size
        } else if (dimensions.includes('3x4') || dimensions.includes('10.5x20.5')) {
            return '📏'; // Large size
        } else {
            return '📐'; // Default icon
        }
    };

    // Don't render if only one unit type
    if (unitTypes.length <= 1) {
        return null;
    }

    return (
        <div className={`space-y-3 ${className}`}>
            <h3 className="text-lg font-medium text-gray-900">Dinding</h3>
            
            {/* Size options grid */}
            <div className="grid grid-cols-2 gap-3">
                {unitTypes.map((unitType) => (
                    <button
                        key={unitType.id}
                        type="button"
                        onClick={() => handleSizeSelect(unitType)}
                        className={`
                            p-4 rounded-lg border-2 text-center transition-all duration-200
                            hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                            ${isSelected(unitType)
                                ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                            }
                        `}
                        title={`Pilih ukuran ${unitType.label}`}
                        aria-label={`Pilih ukuran ${unitType.label}`}
                        aria-pressed={isSelected(unitType)}
                    >
                        {/* Size icon */}
                        <div className="text-2xl mb-2" aria-hidden="true">
                            {getSizeIcon(unitType.label)}
                        </div>
                        
                        {/* Size label */}
                        <div className="text-sm font-medium text-gray-900">
                            {unitType.label}
                        </div>
                        
                        {/* Selection indicator */}
                        {isSelected(unitType) && (
                            <div className="mt-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto" aria-hidden="true" />
                            </div>
                        )}
                    </button>
                ))}
            </div>
            
            {/* Selected size info */}
            <div className="text-sm text-gray-600">
                Ukuran terpilih: <span className="font-medium">{selectedUnitType?.label}</span>
            </div>
        </div>
    );
};

export default SizeSelector;
