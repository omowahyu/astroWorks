import React, { useState } from 'react';
import { Head, usePage, Link, router } from '@inertiajs/react';
import DynamicImageSingle from '@/components/image/dynamic-image-single';

interface CartItem {
  product_id: number;
  product_name: string;
  product_image: string;
  unit_type_id: number;
  unit_type_label: string;
  unit_price: number;
  misc_options?: Record<string, string>;
  quantity: number;
  item_total: number;
}

interface CartBatch {
  batch_id: number;
  batch_name: string;
  main_product: CartItem;
  accessories: CartItem[];
  batch_total: number;
  created_at: string;
}

interface PageProps {
  cart: CartBatch[];
  env: {
    WHATSAPP_NUMBER: string;
    BANK_NAME: string;
    BANK_ACCOUNT_NAME: string;
    BANK_ACCOUNT_NUMBER: string;
    WHATSAPP_MESSAGE_TEMPLATE: string;
  };
}

export default function Cart() {
  const { cart, env } = usePage<PageProps>().props;
  const [localCart, setLocalCart] = useState<CartBatch[]>(cart);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const updateQuantity = (batchIndex: number, itemType: 'main' | 'accessory', itemIndex: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    const updatedCart = [...localCart];
    const batch = updatedCart[batchIndex];

    if (itemType === 'main') {
      const oldQuantity = batch.main_product.quantity;
      batch.main_product.quantity = newQuantity;
      batch.main_product.item_total = batch.main_product.unit_price * newQuantity;

      // Update accessories quantities proportionally
      batch.accessories.forEach(accessory => {
        const accessoryPerMainUnit = accessory.quantity / oldQuantity;
        accessory.quantity = Math.round(accessoryPerMainUnit * newQuantity);
        accessory.item_total = accessory.unit_price * accessory.quantity;
      });
    } else {
      batch.accessories[itemIndex].quantity = newQuantity;
      batch.accessories[itemIndex].item_total = batch.accessories[itemIndex].unit_price * newQuantity;
    }

    // Recalculate batch total
    batch.batch_total = batch.main_product.item_total + 
      batch.accessories.reduce((sum, acc) => sum + acc.item_total, 0);

    setLocalCart(updatedCart);

    // Update session
    router.post('/update-cart', { cart: updatedCart }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  const removeBatch = (batchIndex: number) => {
    const updatedCart = localCart.filter((_, index) => index !== batchIndex);
    setLocalCart(updatedCart);

    router.post('/update-cart', { cart: updatedCart }, {
      preserveState: true,
      preserveScroll: true
    });
  };

  const grandTotal = localCart.reduce((sum, batch) => sum + batch.batch_total, 0);

  const handleWhatsAppCheckout = () => {
    if (localCart.length === 0) {
      alert('Keranjang belanja kosong');
      return;
    }

    // Generate order details
    let orderDetails = '';
    localCart.forEach((batch, index) => {
      orderDetails += `${index + 1}. ${batch.batch_name.toUpperCase()}\n`;
      orderDetails += `   - ${batch.main_product.product_name} (${batch.main_product.unit_type_label})\n`;
      orderDetails += `   - Jumlah: ${batch.main_product.quantity}\n`;
      orderDetails += `   - Harga: ${formatPrice(batch.main_product.item_total)}\n`;

      if (batch.accessories.length > 0) {
        orderDetails += `   - Tambahan:\n`;
        batch.accessories.forEach(accessory => {
          orderDetails += `     • ${accessory.product_name} (${accessory.quantity}x) - ${formatPrice(accessory.item_total)}\n`;
        });
      }

      orderDetails += `   - Subtotal: ${formatPrice(batch.batch_total)}\n\n`;
    });

    // Use template message if available, otherwise use default
    let message = env.WHATSAPP_MESSAGE_TEMPLATE ||
      `Halo, saya ingin memesan:\n\n{order_details}\n\nTOTAL KESELURUHAN: {total}\n\nMohon konfirmasi ketersediaan dan total pembayaran. Terima kasih!`;

    // Replace placeholders
    message = message.replace('{order_details}', orderDetails);
    message = message.replace('{total}', formatPrice(grandTotal));

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = env.WHATSAPP_NUMBER;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  if (localCart.length === 0) {
    return (
      <>
        <Head title="Keranjang Belanja - Astro Works" />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Keranjang Belanja</h1>
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0h15M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"></path>
              </svg>
              <h2 className="text-xl font-medium text-gray-900 mb-2">Keranjang Anda Kosong</h2>
              <p className="text-gray-600 mb-6">Belum ada produk yang ditambahkan ke keranjang</p>
              <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Mulai Belanja
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head title="Keranjang Belanja - Astro Works" />
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">KERANJANG BELANJA</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-8">
              {localCart.map((batch, batchIndex) => (
                <div key={batch.batch_id} className="space-y-4">
                  {/* Batch Header */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">
                      {batchIndex + 1}. {batch.batch_name.toUpperCase()}
                    </h2>
                    <button
                      onClick={() => removeBatch(batchIndex)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Hapus
                    </button>
                  </div>

                  {/* Main Product */}
                  <div className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg">
                    <div className="w-24 h-24 flex-shrink-0">
                      <DynamicImageSingle
                        productId={batch.main_product.product_id.toString()}
                        alt={batch.main_product.product_name}
                        className="w-full h-full rounded-lg"
                        rounded="lg"
                        useDatabase={true}
                        preferThumbnail={true}
                        imageType="thumbnail"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-bold text-gray-900 text-lg">{batch.main_product.product_name.toUpperCase()}</h3>
                      <p className="text-sm text-gray-600 mb-1">{batch.main_product.unit_type_label}</p>
                      <p className="text-sm font-medium text-gray-900">
                        Rp {formatPrice(batch.main_product.unit_price).replace('Rp', '').trim()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3 bg-white rounded-full px-3 py-1 border">
                      <button
                        onClick={() => updateQuantity(batchIndex, 'main', 0, batch.main_product.quantity - 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 text-lg"
                        disabled={batch.main_product.quantity <= 1}
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">{batch.main_product.quantity}</span>
                      <button
                        onClick={() => updateQuantity(batchIndex, 'main', 0, batch.main_product.quantity + 1)}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 text-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Accessories */}
                  {batch.accessories.map((accessory, accessoryIndex) => (
                    <div key={accessory.product_id} className="flex items-start space-x-4 bg-gray-50 p-4 rounded-lg ml-8">
                      <div className="w-20 h-20 flex-shrink-0">
                        <DynamicImageSingle
                          productId={accessory.product_id.toString()}
                          alt={accessory.product_name}
                          className="w-full h-full rounded-lg"
                          rounded="lg"
                          useDatabase={true}
                          preferThumbnail={true}
                          imageType="thumbnail"
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-medium text-gray-900">{accessory.product_name}</h4>
                        <p className="text-sm text-gray-600 mb-1">{accessory.unit_type_label}</p>
                        <p className="text-sm font-medium text-gray-900">
                          Rp {formatPrice(accessory.unit_price).replace('Rp', '').trim()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 bg-white rounded-full px-3 py-1 border">
                        <button
                          onClick={() => updateQuantity(batchIndex, 'accessory', accessoryIndex, accessory.quantity - 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 text-lg"
                          disabled={accessory.quantity <= 1}
                        >
                          −
                        </button>
                        <span className="w-8 text-center font-medium">{accessory.quantity}</span>
                        <button
                          onClick={() => updateQuantity(batchIndex, 'accessory', accessoryIndex, accessory.quantity + 1)}
                          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-gray-100 text-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Batch Total */}
                  <div className="mt-6 pt-4 border-t-2 border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">TOTAL TAGIHAN</span>
                      <span className="text-2xl font-bold text-gray-900">{formatPrice(batch.batch_total).replace('Rp', '').trim()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 sticky top-8">
                <div className="space-y-4 mb-6">
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">{formatPrice(grandTotal).replace('Rp', '').trim()}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-2">Transfer</p>
                    <p className="font-medium">Bank {env.BANK_NAME}</p>
                    <p className="font-medium">{env.BANK_ACCOUNT_NAME}</p>
                    <p className="font-mono font-bold text-lg">{env.BANK_ACCOUNT_NUMBER}</p>
                  </div>

                  <button
                    onClick={handleWhatsAppCheckout}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.097"/>
                    </svg>
                    <span>Konfirmasi via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
