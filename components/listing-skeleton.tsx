"use client";

export default function ListingSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-48 mb-3 rounded-xl bg-gray-200 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
      </div>

      {/* Content Skeleton */}
      <div className="space-y-2">
        {/* Title */}
        <div className="flex justify-between items-start gap-2">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-10" />
        </div>

        {/* Location */}
        <div className="h-4 bg-gray-200 rounded w-1/2" />

        {/* Price */}
        <div className="h-5 bg-gray-200 rounded w-2/5 mt-2" />
      </div>
    </div>
  );
}

export function ListingSkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: 12 }).map((_, index) => (
        <ListingSkeleton key={index} />
      ))}
    </div>
  );
}
