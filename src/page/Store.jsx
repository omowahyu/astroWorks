// src/components/Icon.jsx
import React from "react";

// Komponen generik untuk ikon SVG
const Icon = ({ path, className = "w-6 h-6", strokeWidth = 1.5 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={strokeWidth}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d={path} />
  </svg>
);

// Ikon spesifik yang digunakan dalam aplikasi
export const MenuIcon = (props) => (
  <Icon path="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" {...props} />
);
export const ShoppingBagIcon = (props) => (
  <Icon
    path="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
    {...props}
  />
);
export const UserIcon = (props) => (
  <Icon
    path="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
    {...props}
  />
);
export const ChatBubbleIcon = (props) => (
  <Icon
    path="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443h2.284M1.946 4.852A4.5 4.5 0 016.446 3h11.108a4.5 4.5 0 014.5 4.5v5.25a4.5 4.5 0 01-4.5 4.5h-3.453a1.526 1.526 0 00-1.037.443L11.5 21H6.446a4.5 4.5 0 01-4.5-4.5v-5.25a4.5 4.5 0 01.001-1.648z"
    {...props}
  />
);
export const PlusIcon = (props) => (
  <Icon path="M12 4.5v15m7.5-7.5h-15" className="w-4 h-4" {...props} />
);
export const MinusIcon = (props) => (
  <Icon path="M18 12H6" className="w-4 h-4" {...props} />
);
export const CheckIcon = (props) => (
  <Icon
    path="M4.5 12.75l6 6 9-13.5"
    className="w-4 h-4"
    strokeWidth={3}
    {...props}
  />
);

// src/components/Navbar.jsx
// Komponen untuk bilah navigasi
const Navbar = ({ companyName = "ASTRO-WORKS" }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Desktop Navbar */}
        <div className="hidden lg:flex justify-between items-center py-4">
          <a href="#" className="text-3xl font-bold text-sky-600">
            {companyName}
          </a>
          <div className="flex items-center space-x-6">
            <a
              href="#"
              className="text-neutral-600 hover:text-sky-600 transition-colors"
            >
              Company
            </a>
            <a
              href="#"
              className="text-neutral-600 hover:text-sky-600 transition-colors"
            >
              Tutorial
            </a>
            <button
              aria-label="Chat"
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <ChatBubbleIcon />
            </button>
            <button
              aria-label="User Profile"
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <UserIcon />
            </button>
            <button
              aria-label="Shopping Bag"
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <ShoppingBagIcon />
            </button>
          </div>
        </div>

        {/* Mobile Navbar */}
        <div className="lg:hidden flex justify-between items-center py-3">
          <button
            aria-label="Open menu"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-neutral-600 focus:outline-none p-2"
          >
            <MenuIcon />
          </button>
          <a href="#" className="text-2xl font-bold text-sky-600">
            {companyName}
          </a>
          <div className="flex items-center space-x-2">
            <button
              aria-label="Shopping Bag"
              className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
            >
              <ShoppingBagIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden pb-3 absolute bg-white w-full left-0 shadow-lg rounded-b-md">
            <a
              href="#"
              className="block py-2.5 px-4 text-neutral-600 hover:bg-sky-50 rounded transition-colors"
            >
              Company
            </a>
            <a
              href="#"
              className="block py-2.5 px-4 text-neutral-600 hover:bg-sky-50 rounded transition-colors"
            >
              Tutorial
            </a>
            <a
              href="#"
              className="block py-2.5 px-4 text-neutral-600 hover:bg-sky-50 rounded transition-colors"
            >
              Chat
            </a>
            <a
              href="#"
              className="block py-2.5 px-4 text-neutral-600 hover:bg-sky-50 rounded transition-colors"
            >
              Profile
            </a>
          </div>
        )}
      </div>
    </nav>
  );
};

// src/components/ThumbnailGallery.jsx
// Komponen untuk galeri gambar mini
const ThumbnailGallery = ({ images, onSelectImage, selectedImage }) => {
  if (!images || images.length === 0) {
    return (
      <div className="text-center text-neutral-500 py-4">
        No images available.
      </div>
    );
  }
  return (
    <div className="flex space-x-2 overflow-x-auto p-2 lg:p-0 lg:space-x-3 mt-2 lg:mt-4">
      {images.map((image, index) => (
        <button
          key={image.thumb || index} // Gunakan ID unik jika tersedia, fallback ke index
          onClick={() => onSelectImage(image.full)}
          aria-label={`View image ${index + 1}`}
          className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-md overflow-hidden border-2 transition-all focus:outline-none focus:ring-2 focus:ring-sky-400
                      ${selectedImage === image.full ? "border-sky-500 scale-105" : "border-neutral-300 hover:border-sky-400"}`}
        >
          <img
            src={image.thumb}
            alt={`Thumbnail ${index + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/100x100/cccccc/888888?text=Error";
            }}
          />
        </button>
      ))}
    </div>
  );
};

// src/components/OptionSelector.jsx
// Komponen untuk memilih opsi (misalnya warna, ukuran)
const OptionSelector = ({
  label,
  options,
  selectedOption,
  onSelectOption,
  type = "color",
}) => {
  return (
    <div className="mb-4 lg:mb-6">
      <h3 className="text-sm font-semibold text-neutral-700 mb-2">{label}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelectOption(option.value)}
            aria-pressed={selectedOption === option.value}
            className={`py-2 px-3 rounded-md text-xs lg:text-sm border transition-all focus:outline-none focus:ring-2 focus:ring-offset-1
                        ${
                          selectedOption === option.value
                            ? "bg-sky-500 text-white border-sky-500 ring-sky-300"
                            : "bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500 focus:ring-sky-300"
                        }
                        ${type === "color" ? "w-8 h-8 lg:w-9 lg:h-9 p-0 flex items-center justify-center" : ""}
                      `}
            style={
              type === "color" ? { backgroundColor: option.colorCode } : {}
            }
            title={option.label}
          >
            {type !== "color" && option.label}
            {type === "color" && selectedOption === option.value && (
              <CheckIcon className="text-white" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// src/components/AdditionalItem.jsx
// Komponen untuk item tambahan dengan kontrol kuantitas
const AdditionalItem = ({ item, quantity, onQuantityChange }) => {
  const handleIncrement = () => onQuantityChange(item.id, quantity + 1);
  const handleDecrement = () =>
    onQuantityChange(item.id, Math.max(0, quantity - 1));

  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-b-0">
      <div className="flex items-center space-x-3">
        <img
          src={item.image}
          alt={item.name}
          className="w-12 h-12 lg:w-16 lg:h-16 rounded-md object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/64x64/e0e0e0/777777?text=Img";
          }}
        />
        <div>
          <p className="text-sm lg:text-base font-medium text-neutral-800">
            {item.name}
          </p>
          <p className="text-xs lg:text-sm text-sky-600 font-semibold">
            Rp {item.price.toLocaleString("id-ID")}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleDecrement}
          aria-label={`Kurangi kuantitas ${item.name}`}
          className="p-1.5 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-sky-300"
          disabled={quantity === 0}
        >
          <MinusIcon />
        </button>
        <span
          className="text-sm lg:text-base font-medium w-8 text-center"
          aria-live="polite"
        >
          {quantity}
        </span>
        <button
          onClick={handleIncrement}
          aria-label={`Tambah kuantitas ${item.name}`}
          className="p-1.5 rounded-full bg-neutral-200 hover:bg-neutral-300 text-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-300"
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
};

// src/components/ProductInfo.jsx
// Komponen untuk menampilkan informasi produk dan opsi
const ProductInfo = ({
  product,
  themes,
  selectedTheme,
  onThemeChange,
  wallSizes,
  selectedWallSize,
  onWallSizeChange,
  additionalItemsData,
  additionalItemQuantities,
  onQuantityChange,
  onAddToCart,
}) => {
  return (
    <div className="lg:w-2/5 xl:w-1/3 p-4 lg:p-6 lg:overflow-y-auto lg:max-h-[calc(100vh-120px)]">
      {" "}
      {/* Max height for scroll on desktop */}
      <h1 className="text-2xl lg:text-3xl font-bold text-neutral-800 mb-1">
        {product.name}
      </h1>
      <p className="text-sm text-neutral-500 mb-2">{product.variant}</p>
      <p className="text-xl lg:text-2xl font-bold text-sky-600 mb-4 lg:mb-6">
        Rp {product.price.toLocaleString("id-ID")}
      </p>
      <OptionSelector
        label="Tema"
        options={themes}
        selectedOption={selectedTheme}
        onSelectOption={onThemeChange}
        type="color"
      />
      <OptionSelector
        label="Dinding"
        options={wallSizes}
        selectedOption={selectedWallSize}
        onSelectOption={onWallSizeChange}
        type="text"
      />
      <div className="mb-4 lg:mb-6">
        <h3 className="text-sm font-semibold text-neutral-700 mb-2">
          Deskripsi
        </h3>
        <p className="text-xs lg:text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
          {product.description}
        </p>
      </div>
      {additionalItemsData && additionalItemsData.length > 0 && (
        <div className="mb-4 lg:mb-6">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">
            Item Tambahan
          </h3>
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            {additionalItemsData.map((item) => (
              <AdditionalItem
                key={item.id}
                item={item}
                quantity={additionalItemQuantities[item.id] || 0}
                onQuantityChange={onQuantityChange}
              />
            ))}
          </div>
        </div>
      )}
      <button
        onClick={onAddToCart}
        className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-sm lg:text-base focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
      >
        <ShoppingBagIcon className="w-5 h-5" />
        <span>Tambah ke Keranjang</span>
      </button>
    </div>
  );
};

// src/components/ProductDisplay.jsx
// Komponen untuk menampilkan gambar produk utama dan galeri thumbnail
const ProductDisplay = ({
  mainImage,
  allImages,
  onSelectThumbnail,
  companyName = "ASTRO WORKS",
}) => {
  return (
    <div className="lg:w-3/5 xl:w-2/3 p-4 lg:p-6">
      {" "}
      {/* Adjusted padding for desktop */}
      <div className="relative aspect-[16/10] rounded-lg overflow-hidden shadow-lg bg-neutral-200 mb-4">
        {" "}
        {/* Adjusted aspect ratio slightly */}
        <img
          src={mainImage}
          alt="Produk utama"
          className="w-full h-full object-contain" // object-contain to see full image
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://placehold.co/800x500/cccccc/888888?text=Image+Not+Found";
          }}
        />
        <div className="absolute top-4 left-4 lg:top-6 lg:left-6">
          <span className="bg-black/60 text-white text-xs lg:text-sm font-semibold px-3 py-1.5 rounded">
            {companyName}
          </span>
        </div>
      </div>
      <ThumbnailGallery
        images={allImages}
        onSelectImage={onSelectThumbnail}
        selectedImage={mainImage}
      />
    </div>
  );
};

// src/App.jsx
// Komponen aplikasi utama
const App = () => {
  // Data produk (contoh, idealnya dari API)
  const initialProductData = React.useMemo(
    () => ({
      name: "Fantasy TV Cabinet Hitam",
      variant: "2,4 x 2,7m Gola",
      price: 1590000, // Harga disesuaikan agar lebih realistis
      description:
        "Kabinet TV modern dengan finishing hitam elegan.\nMaterial: Plywood berkualitas tinggi dengan lapisan melamin.\nPintu soft-close untuk kenyamanan ekstra.\nDilengkapi lampu LED untuk suasana mewah.",
      mainImage: "https://placehold.co/800x500/333333/ffffff?text=TV+Cabinet+1",
      allImages: [
        {
          thumb: "https://placehold.co/100x100/333333/ffffff?text=Thumb+1",
          full: "https://placehold.co/800x500/333333/ffffff?text=TV+Cabinet+1",
        },
        {
          thumb: "https://placehold.co/100x100/444444/ffffff?text=Thumb+2",
          full: "https://placehold.co/800x500/444444/ffffff?text=TV+Cabinet+2",
        },
        {
          thumb: "https://placehold.co/100x100/555555/ffffff?text=Thumb+3",
          full: "https://placehold.co/800x500/555555/ffffff?text=TV+Cabinet+3",
        },
        {
          thumb: "https://placehold.co/100x100/666666/ffffff?text=Thumb+4",
          full: "https://placehold.co/800x500/666666/ffffff?text=TV+Cabinet+4",
        },
        {
          thumb: "https://placehold.co/100x100/777777/ffffff?text=Thumb+5",
          full: "https://placehold.co/800x500/777777/ffffff?text=TV+Cabinet+5",
        },
      ],
    }),
    [],
  );

  const themesData = React.useMemo(
    () => [
      { value: "dark_blue", label: "Biru Tua", colorCode: "#3B5998" },
      { value: "black", label: "Hitam", colorCode: "#222222" },
      { value: "beige", label: "Krem", colorCode: "#F5F5DC" },
      { value: "brown", label: "Cokelat", colorCode: "#A52A2A" },
      { value: "grey", label: "Abu-abu", colorCode: "#666666" },
      { value: "light_brown", label: "Cokelat Muda", colorCode: "#D2B48C" },
    ],
    [],
  );

  const wallSizesData = React.useMemo(
    () => [
      { value: "2x3m", label: "2x3m" },
      { value: "2.4x2.7m", label: "2.4x2.7m" },
      { value: "3x3m", label: "3x3m" },
      { value: "3.5x3m", label: "3.5x3m" },
    ],
    [],
  );

  const additionalItemsList = React.useMemo(
    () => [
      {
        id: "ledStrip",
        name: "LED Strip Tambahan",
        price: 150000,
        image: "https://placehold.co/100x100/e0e0e0/777777?text=LED",
      },
      {
        id: "rakKaca",
        name: "Rak Kaca Ekstra",
        price: 250000,
        image: "https://placehold.co/100x100/d0d0d0/777777?text=Rak",
      },
      {
        id: "bracketPremium",
        name: "Bracket Dinding Premium",
        price: 300000,
        image: "https://placehold.co/100x100/c0c0c0/777777?text=Bracket",
      },
    ],
    [],
  );

  const [currentProduct, setCurrentProduct] =
    React.useState(initialProductData);
  const [selectedImage, setSelectedImage] = React.useState(
    initialProductData.allImages[0].full,
  );
  const [selectedTheme, setSelectedTheme] = React.useState(themesData[1].value); // Default Hitam
  const [selectedWallSize, setSelectedWallSize] = React.useState(
    wallSizesData[1].value,
  );
  const [additionalItemQuantities, setAdditionalItemQuantities] =
    React.useState({});

  // Efek untuk menginisialisasi gambar utama saat produk berubah
  React.useEffect(() => {
    if (currentProduct.allImages && currentProduct.allImages.length > 0) {
      setSelectedImage(currentProduct.allImages[0].full);
    }
  }, [currentProduct]);

  const handleThumbnailSelect = React.useCallback((imageUrl) => {
    setSelectedImage(imageUrl);
  }, []);

  const handleQuantityChange = React.useCallback((itemId, newQuantity) => {
    setAdditionalItemQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemId]: newQuantity,
    }));
  }, []);

  const handleAddToCart = React.useCallback(() => {
    // Logika untuk menambahkan ke keranjang
    // Ini bisa melibatkan pengiriman data ke server atau pembaruan state global
    const cartItem = {
      product: {
        name: currentProduct.name,
        variant: currentProduct.variant,
        price: currentProduct.price,
      },
      theme: selectedTheme,
      wallSize: selectedWallSize,
      additionalItems: Object.entries(additionalItemQuantities)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => ({
          ...additionalItemsList.find((item) => item.id === id),
          quantity: qty,
        })),
      totalPrice: calculateTotalPrice(), // Anda perlu membuat fungsi ini
    };
    console.log("Item ditambahkan ke keranjang:", cartItem);
    // Di sini Anda bisa menampilkan notifikasi atau mengarahkan pengguna
    // Untuk sekarang, kita hanya log ke konsol
    alert("Produk ditambahkan ke keranjang! (Lihat konsol untuk detail)");
  }, [
    currentProduct,
    selectedTheme,
    selectedWallSize,
    additionalItemQuantities,
    additionalItemsList,
  ]);

  // Fungsi pembantu untuk menghitung total harga (contoh)
  const calculateTotalPrice = () => {
    let total = currentProduct.price;
    Object.entries(additionalItemQuantities).forEach(([itemId, qty]) => {
      if (qty > 0) {
        const itemDetails = additionalItemsList.find(
          (item) => item.id === itemId,
        );
        if (itemDetails) {
          total += itemDetails.price * qty;
        }
      }
    });
    return total;
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      <Navbar companyName="ASTRO-WORKS" />
      <main className="container mx-auto mt-0 lg:mt-6 p-0 lg:p-4 flex-grow">
        <div className="flex flex-col lg:flex-row bg-white lg:rounded-xl lg:shadow-xl overflow-hidden lg:max-h-[calc(100vh-100px)]">
          {" "}
          {/* Batasi tinggi pada desktop */}
          {/* Area Tampilan Produk (Kiri di Desktop, Atas di Mobile) */}
          <div className="lg:order-1 w-full lg:w-3/5 xl:w-2/3 lg:border-r lg:border-neutral-200">
            <ProductDisplay
              mainImage={selectedImage}
              allImages={currentProduct.allImages}
              onSelectThumbnail={handleThumbnailSelect}
              companyName="ASTRO WORKS"
            />
          </div>
          {/* Area Info Produk (Kanan di Desktop, Bawah di Mobile) */}
          <div className="lg:order-2 w-full lg:w-2/5 xl:w-1/3">
            <ProductInfo
              product={{
                name: currentProduct.name,
                variant: currentProduct.variant,
                price: currentProduct.price,
                description: currentProduct.description,
              }}
              themes={themesData}
              selectedTheme={selectedTheme}
              onThemeChange={setSelectedTheme}
              wallSizes={wallSizesData}
              selectedWallSize={setSelectedWallSize}
              onWallSizeChange={setSelectedWallSize}
              additionalItemsData={additionalItemsList}
              additionalItemQuantities={additionalItemQuantities}
              onQuantityChange={handleQuantityChange}
              onAddToCart={handleAddToCart}
            />
          </div>
        </div>
      </main>
      <footer className="text-center py-6 text-neutral-500 text-sm bg-neutral-200 lg:bg-transparent">
        © {new Date().getFullYear()} ASTRO-WORKS. Hak Cipta Dilindungi.
      </footer>
    </div>
  );
};

export default App;
