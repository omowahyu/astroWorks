import React from 'react';
import { COLOR_THEMES, SelectedMiscOptions } from '@/types/product';

/**
 * Props for the ColorSelector component
 */
interface ColorSelectorProps {
    /** Currently selected misc options */
    selectedMiscOptions: SelectedMiscOptions;
    /** Callback when a color is selected */
    onColorChange: (color: string) => void;
    /** Additional CSS classes */
    className?: string;
}

/**
 * ColorSelector Component
 * 
 * Displays color options in a horizontal row as specified in the design.
 * Uses predefined color themes and handles selection state.
 * 
 * @param props - Component props
 * @returns JSX element containing color selection buttons
 */
export const ColorSelector: React.FC<ColorSelectorProps> = ({
    selectedMiscOptions,
    onColorChange,
    className = ''
}) => {
    /**
     * Get the currently selected color theme
     */
    const getSelectedColor = (): string => {
        return selectedMiscOptions['Tema'] || COLOR_THEMES[0].name;
    };

    /**
     * Handle color selection
     */
    const handleColorSelect = (colorName: string): void => {
        onColorChange(colorName);
    };

    /**
     * Check if a color is currently selected
     */
    const isColorSelected = (colorName: string): boolean => {
        const selectedColor = getSelectedColor();
        return selectedColor === colorName;
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <h3 className="text-lg font-medium text-gray-900">Tema</h3>
            
            {/* Color options in a single horizontal row */}
            <div className="flex space-x-3">
                {COLOR_THEMES.map((theme) => (
                    <button
                        key={theme.name}
                        type="button"
                        onClick={() => handleColorSelect(theme.name)}
                        className={`
                            w-10 h-10 rounded-full border-2 transition-all duration-200 
                            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                            hover:scale-105 active:scale-95
                            ${isColorSelected(theme.name)
                                ? 'border-gray-800 ring-2 ring-offset-2 ring-gray-300 shadow-lg'
                                : 'border-gray-300 hover:border-gray-400'
                            }
                        `}
                        style={{ backgroundColor: theme.color }}
                        title={`Pilih tema ${theme.name}`}
                        aria-label={`Pilih tema ${theme.name}`}
                        aria-pressed={isColorSelected(theme.name)}
                    >
                        {/* Selection indicator */}
                        {isColorSelected(theme.name) && (
                            <div 
                                className="w-3 h-3 bg-white rounded-full mx-auto shadow-sm"
                                aria-hidden="true"
                            />
                        )}
                    </button>
                ))}
            </div>
            
            {/* Selected color name display */}
            <div className="text-sm text-gray-600">
                Tema terpilih: <span className="font-medium">{getSelectedColor()}</span>
            </div>
        </div>
    );
};

export default ColorSelector;
