import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: boolean;
}

export function LoadingSkeleton({ 
  className, 
  width = 'w-full', 
  height = 'h-4', 
  rounded = true 
}: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        'loading-skeleton',
        width,
        height,
        rounded && 'rounded',
        className
      )}
      aria-label="Loading..."
    />
  );
}

interface LoadingCardProps {
  className?: string;
}

export function LoadingCard({ className }: LoadingCardProps) {
  return (
    <div className={cn('p-6 border rounded-lg space-y-4', className)}>
      <LoadingSkeleton height="h-6" width="w-3/4" />
      <LoadingSkeleton height="h-4" width="w-full" />
      <LoadingSkeleton height="h-4" width="w-2/3" />
      <div className="flex space-x-2">
        <LoadingSkeleton height="h-8" width="w-16" />
        <LoadingSkeleton height="h-8" width="w-16" />
      </div>
    </div>
  );
}

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function LoadingTable({ rows = 5, columns = 4, className }: LoadingTableProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton 
              key={colIndex} 
              height="h-10" 
              width={colIndex === 0 ? 'w-16' : 'w-full'} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}
