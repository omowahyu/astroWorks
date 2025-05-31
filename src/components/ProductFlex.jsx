import React, { useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';

// Custom hook for responsive calculations
const useResponsiveSlider = (itemCount) => {
  const [config, setConfig] = useState(() => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return {
      itemWidth: isMobile ? 200 : 460,
      gap: isMobile ? 12 : 24,
      visibleItems: isMobile ? 1.8 : 3.2,
      maxIndex: Math.max(0, itemCount - (isMobile ? 1.8 : 3.2))
    };
  });

  useEffect(() => {
    const updateConfig = () => {
      const isMobile = window.innerWidth < 768;
      const newConfig = {
        itemWidth: isMobile ? 200 : 320,
        gap: isMobile ? 12 : 24,
        visibleItems: isMobile ? 1.8 : 3.2,
        maxIndex: Math.max(0, itemCount - (isMobile ? 1.8 : 3.2))
      };
      setConfig(newConfig);
    };

    window.addEventListener('resize', updateConfig);
    return () => window.removeEventListener('resize', updateConfig);
  }, [itemCount]);

  return config;
};

// Product card component
const ProductCard = ({ item, width }) => (
  <div
    key={item.id}
    className="bg-white"
    style={{ width: `${width}px` }}
  >
    <div className="rounded-xl shadow/5 overflow-hidden">
      <img
        src={`https://picsum.photos/seed/${item.id}/600/400`}
        alt={item.name}
        className="h-full w-full object-cover hidden lg:block no-dragable"
        draggable={false}
      />

      <img
        src={`https://picsum.photos/seed/${item.id}/300/700`}
        alt={item.name}
        className="w-full h-full object-cover lg:hidden"
        draggable={false}
      />
    </div>
    <div className="w-full p-2 text-center font-medium text-sm lg:text-xl">
      {item.name}
    </div>
  </div>
);

export default function ProductFlex({ title }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const products = [
    { name: "SORA", id: 1 },
    { name: "Fantasy Pantry Cabinet", id: 2 },
    { name: "Modern Kitchen Set", id: 3 },
    { name: "Elegant Dining Table", id: 4 },
    { name: "Luxury Sofa Collection", id: 5 },
    { name: "Contemporary Bookshelf", id: 6 },
    { name: "Designer Coffee Table", id: 7 },
  ];

  const config = useResponsiveSlider(products.length);
  const x = useMotionValue(0);
  
  const slideToIndex = useCallback((index) => {
    if (isAnimating || index < 0 || index > config.maxIndex) return;
    
    setIsAnimating(true);
    const translateX = -index * config.itemWidth;
    
    animate(x, translateX, {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuart equivalent
      onComplete: () => {
        setCurrentIndex(index);
        setIsAnimating(false);
      }
    });
  }, [isAnimating, config, x]);

  const handleDragEnd = useCallback((event, info) => {
    const threshold = config.itemWidth * 0.25;
    const deltaX = info.offset.x;
    
    let newIndex = currentIndex;
    if (Math.abs(deltaX) > threshold) {
      newIndex = deltaX > 0 
        ? Math.max(currentIndex - 1, 0)
        : Math.min(currentIndex + 1, config.maxIndex);
    }
    
    slideToIndex(newIndex);
  }, [currentIndex, config, slideToIndex]);

  const dragConstraints = {
    left: -config.maxIndex * config.itemWidth - 100,
    right: 100
  };

  return (
    <section className="py-6">
      {title && (
        <h2 className="text-xl lg:text-3xl font-semibold mb-6 px-4 md:px-6">
          {title}
        </h2>
      )}
      
      <div className="overflow-hidden px-4 md:px-6">
        <motion.div
          drag="x"
          dragConstraints={dragConstraints}
          dragElastic={0.3}
          onDragEnd={handleDragEnd}
          className="flex cursor-grab active:cursor-grabbing select-none"
          style={{ 
            gap: `${config.gap}px`,
            width: `${products.length * config.itemWidth}px`,
            x
          }}
          whileDrag={{ cursor: 'grabbing' }}
        >
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              item={product} 
              width={config.itemWidth - config.gap}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}