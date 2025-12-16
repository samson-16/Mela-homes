"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Phone, Mail, MessageCircle, X, CheckCircle } from "lucide-react";
import { ContactPageSkeleton } from "@/components/listing-skeleton";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

interface ListingContact {
  id: number;
  description: string;
  location: string;
  phone_number: string;
  monthly_rent: string;
  currency: string;
  owner_details?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function ContactPage() {
  const params = useParams();
  const router = useRouter();
  const [listing, setListing] = useState<ListingContact | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const listingId = params.id;

  useEffect(() => {
    if (!listingId) return;

    const fetchListing = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/rent-listings/${listingId}/`);
        const listingData = response.data.data || response.data;
        setListing(listingData);
      } catch (error) {
        console.error("Error fetching listing:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleCopyPhone = () => {
    if (listing?.phone_number) {
      navigator.clipboard.writeText(listing.phone_number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCallPhone = () => {
    if (listing?.phone_number) {
      window.location.href = `tel:${listing.phone_number}`;
    }
  };

  const handleWhatsApp = () => {
    if (listing?.phone_number) {
      const message = encodeURIComponent(
        `Hi! I'm interested in the property: ${listing.description || "Listing"} at ${listing.location}`
      );
      window.open(`https://wa.me/${listing.phone_number.replace(/\D/g, "")}?text=${message}`, "_blank");
    }
  };

  if (loading) {
    return <ContactPageSkeleton />;
  }

  if (!listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-background">
        <p className="text-muted-foreground">Contact info not available</p>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  const hostName = listing.owner_details
    ? `${listing.owner_details.first_name} ${listing.owner_details.last_name}`
    : "Property Owner";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-foreground">Contact Information</h1>
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Property Info Card */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {listing.description || "Property"}
          </h2>
          <p className="text-muted-foreground mb-4">📍 {listing.location}</p>
          <p className="text-2xl font-bold text-primary">
            {listing.currency} {Number.parseInt(listing.monthly_rent).toLocaleString()}/month
          </p>
        </div>

        {/* Host Info */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {hostName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">{hostName}</h3>
              {listing.owner_details?.email && (
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4" />
                  {listing.owner_details.email}
                </p>
              )}
            </div>
          </div>

          {/* Phone Number Display */}
          {/* Phone Number Display Hidden for Privacy */}
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleCallPhone}
              className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              size="lg"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Now
            </Button>

            <Button
              onClick={handleWhatsApp}
              className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              size="lg"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> Contact the owner to schedule a viewing or ask questions about the property.
          </p>
        </div>
      </main>
    </div>
  );
}
