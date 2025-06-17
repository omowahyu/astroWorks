import React from 'react';
import { cn } from '@/lib/utils';

interface ImagePlaceholderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  subtext?: string;
  showIcon?: boolean;
}

export function ImagePlaceholder({ 
  className, 
  size = 'md', 
  text = 'Image Tidak Tersedia',
  subtext = 'Gambar belum diupload',
  showIcon = true 
}: ImagePlaceholderProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-xs',
    md: 'w-24 h-24 text-sm',
    lg: 'w-32 h-32 text-base',
    xl: 'w-48 h-48 text-lg'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg',
      sizeClasses[size],
      className
    )}>
      {showIcon && (
        <svg 
          className={cn('text-gray-400 dark:text-gray-500 mb-2', iconSizes[size])} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </svg>
      )}
      
      <div className="text-center px-2">
        <p className="font-medium text-gray-600 dark:text-gray-300 leading-tight">
          {text}
        </p>
        {subtext && size !== 'sm' && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}

// SVG Placeholder sebagai string untuk digunakan di img src
export const getPlaceholderSvg = (text: string = 'Image Tidak Tersedia', subtext: string = 'Gambar belum diupload') => {
  const svg = `
    <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="400" height="400" fill="#F8FAFC"/>
      
      <!-- Container -->
      <rect x="50" y="80" width="300" height="240" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
      
      <!-- Icon circle -->
      <circle cx="200" cy="160" r="40" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="2"/>
      
      <!-- Image icon -->
      <g transform="translate(180, 140)">
        <rect x="0" y="0" width="40" height="32" rx="4" fill="none" stroke="#94A3B8" stroke-width="2"/>
        <path d="M6 24 L14 16 L22 20 L30 14 L34 18 L34 26 L6 26 Z" fill="#CBD5E1"/>
        <circle cx="30" cy="8" r="3" fill="#FCD34D"/>
        <path d="M4 4 L8 4 L4 8 Z" fill="#94A3B8"/>
      </g>
      
      <!-- Main text -->
      <text x="200" y="230" text-anchor="middle" fill="#475569" font-family="system-ui, sans-serif" font-size="16" font-weight="600">
        ${text}
      </text>
      
      <!-- Subtitle -->
      <text x="200" y="250" text-anchor="middle" fill="#94A3B8" font-family="system-ui, sans-serif" font-size="12">
        ${subtext}
      </text>
      
      <!-- Branding -->
      <text x="200" y="340" text-anchor="middle" fill="#CBD5E1" font-family="system-ui, sans-serif" font-size="10" letter-spacing="1px">
        ASTROWORKS
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default ImagePlaceholder;
