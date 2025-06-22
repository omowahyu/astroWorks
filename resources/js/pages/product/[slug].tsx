import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import DynamicImageSingle from '@/components/image/dynamic-image-single';
import DynamicImageGallery from '@/components/image/dynamic-image-gallery';

// TypeScript interfaces
interface ProductImageData {
  id: number;
  image_type: 'thumbnail' | 'gallery' | 'hero';
  sort_order: number;
  alt_text: string;
  image_url: string;
  variants?: any;
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

export default function ProductShow() {
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
    if (!selectedUnitType) {
      alert('Please select a size/dimension');
      return;
    }

    // Prepare main product data
    const mainProduct = {
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.main_thumbnail?.image_url || '',
      unit_type_id: selectedUnitType.id,
      unit_type_label: selectedUnitType.label,
      unit_price: parseFloat(selectedUnitType.price),
      misc_options: selectedMiscOptions,
      quantity: quantity,
      item_total: basePrice
    };

    // Prepare accessories data
    const accessoriesData = Object.values(selectedAccessories).map(item => ({
      product_id: item.accessory.id,
      product_name: item.accessory.name,
      product_image: item.accessory.main_thumbnail?.image_url || '',
      unit_type_id: item.accessory.default_unit?.id,
      unit_type_label: item.accessory.default_unit?.label || 'Default',
      unit_price: parseFloat(item.accessory.default_unit?.price || '0'),
      quantity: item.quantity,
      item_total: parseFloat(item.accessory.default_unit?.price || '0') * item.quantity
    }));

    // Create cart batch
    const cartBatch = {
      batch_id: Date.now(), // Unique batch identifier
      batch_name: product.name, // Main product name as batch name
      main_product: mainProduct,
      accessories: accessoriesData,
      batch_total: finalTotal
    };

    // Send to backend
    router.post('/add-to-cart', cartBatch, {
      onSuccess: () => {
        // Redirect to cart page
        router.visit('/cart');
      },
      onError: (errors) => {
        console.error('Error adding to cart:', errors);
        alert('Failed to add to cart. Please try again.');
      }
    });
  }, [product, selectedUnitType, selectedMiscOptions, selectedAccessories, quantity, basePrice, finalTotal, router]);

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
                {/* Always use single image for now - gallery disabled until image data is properly loaded */}
                <DynamicImageSingle
                  productId={product.id.toString()}
                  alt={product.name}
                  className="w-full aspect-[4/5] md:aspect-[16/9] rounded-3xl"
                  rounded="3xl"
                  useDatabase={true}
                  preferThumbnail={false}
                  imageType="gallery"
                  productImages={product.images}
                />
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
                {product.unit_types && product.unit_types.length > 0 ? (
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
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Ukuran/Dimensi</h3>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-gray-500">Ukuran belum tersedia untuk produk ini.</p>
                      <p className="text-sm text-gray-400 mt-1">Hubungi kami untuk informasi lebih lanjut.</p>
                    </div>
                  </div>
                )}

                {/* Misc Options - Combined Warna/Tema */}
                {product.misc_options && product.misc_options.length > 0 ? (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Warna/Tema</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.misc_options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleMiscOptionChange('color_theme', option.value)}
                          className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                            selectedMiscOptions['color_theme'] === option.value
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {option.value}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Warna/Tema</h3>
                    <div className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-gray-500">Pilihan warna/tema belum tersedia untuk produk ini.</p>
                      <p className="text-sm text-gray-400 mt-1">Hubungi kami untuk informasi lebih lanjut.</p>
                    </div>
                  </div>
                )}

                {/* Product Description */}
                {product.description && (
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">Description</h3>
                    <p className="text-gray-600 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {/* Additional Items (Accessories) */}
                {accessories && accessories.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Additional Items</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {accessories.map((accessory) => (
                        <div key={accessory.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                          <div className="flex items-center space-x-4">
                            {/* Accessory Image */}
                            <div className="w-16 h-16 flex-shrink-0">
                              <DynamicImageSingle
                                productId={accessory.id.toString()}
                                alt={accessory.name}
                                className="w-full h-full rounded-lg"
                                rounded="lg"
                                useDatabase={true}
                                preferThumbnail={true}
                                imageType="thumbnail"
                                productImages={accessory.images}
                              />
                            </div>

                            {/* Accessory Details */}
                            <div className="flex-grow">
                              <h4 className="font-medium text-gray-900">{accessory.name}</h4>
                              {accessory.description && (
                                <p className="text-sm text-gray-600 mt-1">{accessory.description}</p>
                              )}
                              <div className="text-sm font-medium text-blue-600 mt-1">
                                {formatPrice(parseFloat(accessory.default_unit?.price || '0'))}
                              </div>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleAccessoryChange(accessory, Math.max(0, (selectedAccessories[accessory.id]?.quantity || 0) - 1))}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
                                disabled={!selectedAccessories[accessory.id] || selectedAccessories[accessory.id].quantity <= 0}
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-sm font-medium">
                                {selectedAccessories[accessory.id]?.quantity || 0}
                              </span>
                              <button
                                onClick={() => handleAccessoryChange(accessory, (selectedAccessories[accessory.id]?.quantity || 0) + 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 text-sm"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
