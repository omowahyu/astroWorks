import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import DynamicImageSingle from '@/components/image/DynamicImageSingle';
import DynamicImageGallery from '@/components/image/DynamicImageGallery';

// TypeScript interfaces
interface ProductImageData {
  id: number;
  image_type: 'thumbnail' | 'gallery' | 'hero';
  is_thumbnail: boolean;
  is_primary: boolean;
  display_order: number;
  alt_text: string;
  image_url: string;
  variants: {
    original: string;
    mobile_portrait: string | null;
    mobile_square: string | null;
    desktop_landscape: string | null;
  };
}

interface ProductImages {
  thumbnails: ProductImageData[];
  gallery: ProductImageData[];
  hero: ProductImageData[];
  main_thumbnail: ProductImageData | null;
}

interface UnitType {
  id: number;
  label: string;
  price: string;
  is_default: boolean;
}

interface MiscOption {
  id: number;
  label: string;
  value: string;
  is_default: boolean;
}

interface Category {
  id: number;
  name: string;
  is_accessory: boolean;
}

interface Product {
  id: number;
  name: string;
  description: string;
  slug: string;
  images: ProductImages;
  unit_types: UnitType[];
  misc_options: MiscOption[];
  default_unit: UnitType;
  default_misc: MiscOption;
  categories: Category[];
}

interface Accessory {
  id: number;
  name: string;
  default_unit: UnitType;
  default_misc: MiscOption;
  unit_types: UnitType[];
  misc_options: MiscOption[];
  main_thumbnail?: ProductImageData;
}

interface PageProps {
  product: Product;
  accessories: Accessory[];
}

export default function ProductDetail() {
  const { product, accessories } = usePage<PageProps>().props;

  // State management
  const [selectedUnitType, setSelectedUnitType] = useState<UnitType>(product.default_unit);
  const [selectedMiscOptions, setSelectedMiscOptions] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    product.misc_options.forEach((option) => {
      if (option.is_default) {
        defaults[option.label] = option.value;
      }
    });
    return defaults;
  });
  const [selectedAccessories, setSelectedAccessories] = useState<Record<number, { accessory: Accessory; quantity: number }>>({});
  const [quantity, setQuantity] = useState(1);
  const [scrollY, setScrollY] = useState(0);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Derived values
  const showBlurredBg = scrollY > 240;
  const isAccessory = product.categories.some(cat => cat.is_accessory);

  const dynamicProductTitle = useMemo(() => {
    let title = product.name;
    
    // Add selected misc options
    Object.entries(selectedMiscOptions).forEach(([label, value]) => {
      if (label.toLowerCase().includes('tema') || label.toLowerCase().includes('warna')) {
        title += ` ${value}`;
      }
    });
    
    // Add selected unit type
    if (selectedUnitType) {
      title += ` ${selectedUnitType.label}`;
    }
    
    // Add accessories
    const accessoryNames = Object.values(selectedAccessories)
      .filter(item => item.quantity > 0)
      .map(item => item.accessory.name)
      .join(' + ');
    
    return accessoryNames ? `${title} + ${accessoryNames}` : title;
  }, [product.name, selectedMiscOptions, selectedUnitType, selectedAccessories]);

  const basePrice = useMemo(() => {
    return selectedUnitType ? parseFloat(selectedUnitType.price) * quantity : 0;
  }, [selectedUnitType, quantity]);

  const accessoriesTotal = useMemo(() => {
    return Object.values(selectedAccessories).reduce((total, item) => {
      return total + (parseFloat(item.accessory.default_unit.price) * item.quantity * quantity);
    }, 0);
  }, [selectedAccessories, quantity]);

  const finalTotal = useMemo(() => {
    return basePrice + accessoriesTotal;
  }, [basePrice, accessoriesTotal]);

  // Event handlers
  const handleUnitTypeChange = useCallback((unitType: UnitType) => {
    setSelectedUnitType(unitType);
  }, []);

  const handleMiscOptionChange = useCallback((label: string, value: string) => {
    setSelectedMiscOptions(prev => ({ ...prev, [label]: value }));
  }, []);

  const handleAccessoryChange = useCallback((accessory: Accessory, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSelectedAccessories(prev => {
        const updated = { ...prev };
        delete updated[accessory.id];
        return updated;
      });
    } else {
      setSelectedAccessories(prev => ({
        ...prev,
        [accessory.id]: { accessory, quantity: newQuantity }
      }));
    }
  }, []);

  const handleQuantityChange = useCallback((newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity));
  }, []);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const addToCart = useCallback(() => {
    // Implementation for adding to cart
    console.log('Adding to cart:', {
      product: product.id,
      title: dynamicProductTitle,
      unitType: selectedUnitType,
      miscOptions: selectedMiscOptions,
      accessories: selectedAccessories,
      quantity,
      total: finalTotal
    });
  }, [product.id, dynamicProductTitle, selectedUnitType, selectedMiscOptions, selectedAccessories, quantity, finalTotal]);

  return (
    <>
      <Head title={`${dynamicProductTitle} - Astro Works`} />
      
      <div className="min-h-screen bg-[#5F44F0] lg:bg-gray-50">
        {/* Mobile Header */}
        <header className={`fixed lg:hidden top-0 z-50 w-full transition-colors duration-300 ${
          showBlurredBg ? 'bg-black/30 backdrop-blur' : ''
        }`}>
          <div className="w-full flex flex-row mx-auto px-6 py-6 items-center justify-between">
            <Link href="/" className="hover:opacity-80 transition-opacity" aria-label="Go to Homepage">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Link>

            <Link href="/" aria-label="Astro Works Homepage">
              <img src="/assets/logo/Astroworks.svg" alt="Astro Works Logo" className="h-4" />
            </Link>

            <button className="hover:opacity-80 transition-opacity" aria-label="Share this page">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="lg:h-auto lg:container bg-gray-50 lg:px-8 py-0 lg:py-32 mx-auto lg:mt-8 flex flex-col overflow-hidden lg:overflow-x-visible">
          
          {isAccessory ? (
            /* Accessory Product Layout */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column - Single Image */}
              <div className="space-y-4">
                <DynamicImageSingle
                  productId={product.id.toString()}
                  alt={product.name}
                  className="w-full aspect-[4/5] md:aspect-[16/9] rounded-3xl"
                  rounded="3xl"
                  useDatabase={true}
                  preferThumbnail={true}
                  imageType="thumbnail"
                  productImages={product.images}
                />
              </div>

              {/* Right Column - Accessory Details */}
              <div className="space-y-6 px-4">
                <div className="space-y-2">
                  <div className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full mb-2">
                    Accessory
                  </div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{product.name}</h1>
                  <div className="flex items-center space-x-2">
                    <span className="text-3xl font-bold text-gray-900">
                      {formatPrice(parseFloat(product.default_unit.price) * quantity)}
                    </span>
                  </div>
                </div>

                {product.description && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Quantity and Order Section */}
                <div className="border-t pt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Quantity</span>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Unit Price:</span>
                      <span className="font-medium">{formatPrice(parseFloat(product.default_unit.price))}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatPrice(parseFloat(product.default_unit.price) * quantity)}</span>
                    </div>
                  </div>

                  <button
                    onClick={addToCart}
                    className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"></path>
                    </svg>
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Regular Product Layout */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* Left Column - Image Gallery */}
              <div className="space-y-4">
                {product.images.gallery.length > 1 ? (
                  <DynamicImageGallery
                    productId={product.id.toString()}
                    name={product.name}
                    className="w-full"
                    rounded="3xl"
                    useDatabase={true}
                    productImages={product.images}
                  />
                ) : (
                  <DynamicImageSingle
                    productId={product.id.toString()}
                    alt={product.name}
                    className="w-full aspect-[4/5] md:aspect-[16/9] rounded-3xl"
                    rounded="3xl"
                    useDatabase={true}
                    preferThumbnail={true}
                    imageType="thumbnail"
                    productImages={product.images}
                  />
                )}
              </div>

              {/* Right Column - Product Details */}
              <div className="space-y-6 px-4">
                {/* Product Title and Price */}
                <div className="flex items-end justify-between">
                  <div className="space-y-2">
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                      {dynamicProductTitle}
                    </h1>
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(finalTotal)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-10">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleQuantityChange(quantity - 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        disabled={quantity <= 1}
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(quantity + 1)}
                        className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Unit Type Selector */}
                {product.unit_types.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Ukuran/Dimensi</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {product.unit_types.map((unitType) => (
                        <button
                          key={unitType.id}
                          onClick={() => handleUnitTypeChange(unitType)}
                          className={`p-3 rounded-lg border text-left transition-colors ${
                            selectedUnitType?.id === unitType.id
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">{unitType.label}</div>
                          <div className="text-sm text-gray-500">{formatPrice(parseFloat(unitType.price))}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Misc Options */}
                {product.misc_options.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Warna/Tema</h3>
                    {/* Group misc options by label */}
                    {Object.entries(
                      product.misc_options.reduce((acc, option) => {
                        if (!acc[option.label]) acc[option.label] = [];
                        acc[option.label].push(option);
                        return acc;
                      }, {} as Record<string, MiscOption[]>)
                    ).map(([label, options]) => (
                      <div key={label} className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">{label}</label>
                        <div className="flex flex-wrap gap-2">
                          {options.map((option) => (
                            <button
                              key={option.id}
                              onClick={() => handleMiscOptionChange(label, option.value)}
                              className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                                selectedMiscOptions[label] === option.value
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              {option.value}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Product Description */}
                {product.description && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-medium">{formatPrice(basePrice)}</span>
                  </div>
                  {accessoriesTotal > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Accessories:</span>
                      <span className="font-medium">{formatPrice(accessoriesTotal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={addToCart}
                  className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"></path>
                  </svg>
                  <span>Add to Cart</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
