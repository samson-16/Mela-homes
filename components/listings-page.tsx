"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, User, LogOut } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ListingCard from "./listing-card";
import ListingFormModal from "./listing-form-modal";
import AuthModal from "./auth-modal";
import Footer from "./footer";
import { ListingSkeletonGrid } from "./listing-skeleton";
import { useTelegram } from "@/lib/telegram-provider";
import api from "@/lib/axios";

interface Listing {
  id: string | number;
  title: string;
  image: string;
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  location: string;
  propertyType: string;
}

interface BackendListing {
  id: number;
  property_type: string;
  property_type_other: string | null;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  photos: string[];
  monthly_rent: string;
  currency: string;
  initial_deposit: string | null;
  negotiable: boolean;
  phone_number: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

// const MOCK_LISTINGS: Listing[] = [
//   {
//     id: "1",
//     title: "Modern 3-Bedroom Apartment",
//     image: "https://placehold.co/600x400/3b82f6/ffffff?text=3BR+Apartment",
//     price: 1500,
//     currency: "ETB",
//     bedrooms: 3,
//     bathrooms: 2,
//     location: "Addis Ababa, Bole",
//     propertyType: "Apartment",
//   },
//   {
//     id: "2",
//     title: "Spacious Family House",
//     image: "https://placehold.co/600x400/10b981/ffffff?text=4BR+House",
//     price: 3000,
//     currency: "ETB",
//     bedrooms: 4,
//     bathrooms: 3,
//     location: "Addis Ababa, Kazanchis",
//     propertyType: "House",
//   },
//   {
//     id: "3",
//     title: "Cozy Studio Apartment",
//     image: "https://placehold.co/600x400/8b5cf6/ffffff?text=Studio",
//     price: 800,
//     currency: "ETB",
//     bedrooms: 1,
//     bathrooms: 1,
//     location: "Addis Ababa, Piazza",
//     propertyType: "Apartment",
//   },
// ];

import { PROPERTY_TYPES } from "@/lib/constants";

const transformBackendListing = (backendListing: BackendListing): Listing => {
  // Handle photos safely (legacy string[] vs potential object structure)
  let imageUrl = "https://placehold.co/600x400?text=No+Image";
  if (backendListing.photos && backendListing.photos.length > 0) {
    const firstPhoto = backendListing.photos[0];
    if (typeof firstPhoto === "string") {
      imageUrl = firstPhoto;
    } else if (typeof firstPhoto === "object" && (firstPhoto as any).url) {
      imageUrl = (firstPhoto as any).url;
    }
  }

  const standardType = PROPERTY_TYPES.find(t => t.value === backendListing.property_type);
  const propertyTypeName = backendListing.property_type_other || (standardType ? standardType.amharic : backendListing.property_type);

  return {
    id: backendListing.id,
    title:
      backendListing.description ||
      `${propertyTypeName} በ ${backendListing.location}`,
    image: imageUrl,
    price: Number.parseInt(backendListing.monthly_rent),
    currency: backendListing.currency,
    bedrooms: backendListing.bedrooms,
    bathrooms: backendListing.bathrooms,
    location: backendListing.location,
    propertyType: propertyTypeName,
  };
};

export default function ListingsPage() {
  const router = useRouter();
  const { user, token, logout, isLoading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authReason, setAuthReason] = useState<"login" | "post" | null>(null);
  const [isProcessingDeepLink, setIsProcessingDeepLink] = useState(false);

  // Handle Telegram Mini App Deep Linking
  useEffect(() => {
    if (typeof window === "undefined" || authLoading || isProcessingDeepLink) return;

    // Check for start_param in initData
    const webApp = (window as any).Telegram?.WebApp;
    let startParam = webApp?.initDataUnsafe?.start_param;

    // Fallback: Check URL search params (tgWebAppStartParam)
    if (!startParam) {
      const urlParams = new URLSearchParams(window.location.search);
      startParam = urlParams.get("tgWebAppStartParam");
    }

    if (startParam) {
      console.log("Telegram Deep Link detected:", startParam);
      setIsProcessingDeepLink(true);
      
      // Add a small delay to ensure router is ready
      setTimeout(() => {
        if (startParam.startsWith("listing-")) {
          const id = startParam.replace("listing-", "");
          router.push(`/listings/${id}`);
        } else if (startParam.startsWith("contact-")) {
          const id = startParam.replace("contact-", "");
          router.push(`/listings/${id}/contact`);
        } else if (startParam === "create-listing") {
          if (token) {
            setShowFormModal(true);
          } else {
            setAuthReason("post");
            setShowAuthModal(true);
          }
        }
      }, 200);
    }
  }, [router, token, authLoading, isProcessingDeepLink]);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/rent-listings/");
      const data = response.data;
      console.log("[v0] Backend response:", data);

      const listings_array = Array.isArray(data)
        ? data
        : data.results || data.data || [];

      const transformedListings = listings_array
        .map((item: BackendListing) => transformBackendListing(item))
        .filter((listing: Listing) => listing.bedrooms > 0);

      setListings(transformedListings);
      setFilteredListings(transformedListings);
      console.log(
        "[v0] Successfully fetched and transformed listings:",
        transformedListings.length
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("[v0] Failed to fetch listings:", errorMessage);

        setError("Could not load live listings. Showing demo data.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const filtered = listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(value.toLowerCase()) ||
        listing.location.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredListings(filtered);
  };

  const handleListingCreated = () => {
    setShowFormModal(false);
    fetchListings();
  };

  const handlePostClick = () => {
    if (!token) {
      setAuthReason("post");
      setShowAuthModal(true);
      return;
    }
    setShowFormModal(true);
  };

  const handleAuthClose = (open: boolean) => {
    if (!open && authReason === "post" && !token) {
      // If user tried to close while trying to post but not logged in,
      // keep the modal open.
      return;
    }
    
    if (!open) {
      setShowAuthModal(false);
      
      // If they just logged in (token is present) and the reason was post, show the form
      if (authReason === "post" && token) {
        setShowFormModal(true);
      }
      
      setAuthReason(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-white border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">
            Mela Homes
          </h1>
          <div className="flex items-center gap-4">
            {!token ? (
              <Button onClick={() => setShowAuthModal(true)}>Login</Button>
            ) : (
              <>
                <Button
                  onClick={handlePostClick}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Post a Listing</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.avatar || ""} alt={user?.username || "User"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {(user?.username || "U").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user?.username || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user?.email || ""}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Go to Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-amber-800 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by location or property name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </div>

        {loading ? (
          <ListingSkeletonGrid />
        ) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              No listings found
            </p>
            <Button onClick={handlePostClick}>Create First Listing</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredListings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </main>

      {showFormModal && token && (
        <ListingFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleListingCreated}
        />
      )}

      <AuthModal
        isOpen={showAuthModal}
        onOpenChange={handleAuthClose}
        defaultTab="login"
      />

      <Footer />
    </div>
  );
}
