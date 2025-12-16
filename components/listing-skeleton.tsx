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

export function ListingDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Header Skeleton */}
      <div className="border-b border-border bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="w-10 h-10 bg-gray-200 rounded-lg" />
          <div className="flex gap-4">
            <div className="w-20 h-10 bg-gray-200 rounded-lg" />
            <div className="w-20 h-10 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Gallery Skeleton */}
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
          </div>
          <div className="hidden lg:grid grid-cols-2 gap-3 h-96">
            <div className="bg-gray-200 rounded-lg" />
            <div className="bg-gray-200 rounded-lg" />
            <div className="bg-gray-200 rounded-lg" />
            <div className="bg-gray-200 rounded-lg" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Info Skeleton */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-5 bg-gray-200 rounded w-1/2" />
            </div>
            
            <div className="border-t border-border pt-6">
               <div className="h-8 bg-gray-200 rounded w-1/3 mb-6" />
               <div className="grid grid-cols-2 gap-6">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className="flex gap-4">
                     <div className="w-8 h-8 bg-gray-200 rounded" />
                     <div className="h-6 bg-gray-200 rounded w-24" />
                   </div>
                 ))}
               </div>
            </div>
            
            <div className="border-t border-border pt-6">
               <div className="h-8 bg-gray-200 rounded w-1/4 mb-6" />
               <div className="space-y-2">
                 <div className="h-4 bg-gray-200 rounded w-full" />
                 <div className="h-4 bg-gray-200 rounded w-full" />
                 <div className="h-4 bg-gray-200 rounded w-3/4" />
               </div>
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="lg:col-span-1">
             <div className="bg-white border border-border rounded-2xl p-6 space-y-6">
               <div className="h-10 bg-gray-200 rounded w-1/2" />
               <div className="h-24 bg-gray-200 rounded w-full" />
               <div className="h-12 bg-gray-200 rounded w-full" />
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function ContactPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white animate-pulse">
      <div className="border-b border-border bg-white">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between">
           <div className="h-6 bg-gray-200 rounded w-32" />
           <div className="w-8 h-8 bg-gray-200 rounded" />
        </div>
      </div>
      
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-border p-6 h-40">
           <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
           <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
           <div className="h-8 bg-gray-200 rounded w-1/3" />
        </div>
        
        <div className="bg-white rounded-2xl border border-border p-6 h-48">
           <div className="flex gap-4 mb-6">
             <div className="w-16 h-16 bg-gray-200 rounded-full" />
             <div className="space-y-3 flex-1">
               <div className="h-6 bg-gray-200 rounded w-1/2" />
               <div className="h-4 bg-gray-200 rounded w-1/3" />
             </div>
           </div>
           <div className="h-16 bg-gray-200 rounded-xl" />
        </div>
        
        <div className="space-y-3">
           <div className="h-14 bg-gray-200 rounded-lg" />
           <div className="h-14 bg-gray-200 rounded-lg" />
        </div>
      </main>
    </div>
  );
}
