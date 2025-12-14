"use client";

import { Heart, Star } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ListingCardProps {
  listing: {
    id: string | number;
    title: string;
    image: string;
    price: number;
    currency: string;
    bedrooms: number;
    bathrooms: number;
    location: string;
    propertyType: string;
    rating?: number;
    reviewCount?: number;
    isFeatured?: boolean;
  };
}

export default function ListingCard({ listing }: ListingCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/listings/${listing.id}`);
  };

  return (
    <div className="cursor-pointer group" onClick={handleCardClick}>
      {/* Image Container */}
      <div className="relative h-64 mb-3 overflow-hidden rounded-xl bg-muted">
        <img
          src={
            listing.image ||
            "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image"
          }
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image";
          }}
        />

        {/* Guest Favorite Badge */}
        {listing.isFeatured && (
          <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-medium text-foreground">
            Guest favorite
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFavorited(!isFavorited);
          }}
          className="absolute top-3 right-3 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
          aria-label="Add to favorites"
        >
          <Heart
            className={`w-5 h-5 ${
              isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="space-y-1">
        {/* Title and Rating */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
            {listing.title}
          </h3>
          {listing.rating && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star className="w-4 h-4 fill-foreground" />
              <span className="text-sm font-medium text-foreground">
                {listing.rating.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        {/* Location */}
        <p className="text-sm text-muted-foreground line-clamp-1">
          {listing.propertyType} in {listing.location}
        </p>

        {/* Price */}
        <p className="text-sm text-foreground font-semibold pt-2">
          <span className="font-bold">
            {listing.currency} {listing.price.toLocaleString()}
          </span>
          <span className="text-muted-foreground font-normal"> per month</span>
        </p>
      </div>
    </div>
  );
}
