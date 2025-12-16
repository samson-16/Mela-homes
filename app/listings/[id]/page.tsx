"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  Wifi,
  Droplet,
  Lock,
  Zap,
  Heart,
  Share2,
  Grid3x3,
  MessageCircle,
  Edit2,
  Trash2,
} from "lucide-react";
import { ListingDetailSkeleton } from "@/components/listing-skeleton";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/footer";
import api from "@/lib/axios";

interface ListingDetail {
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
  owner: number;
  owner_details?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

const amenityIcons: Record<string, React.ReactNode> = {
  water: <Droplet className="w-6 h-6" />,
  electricity: <Zap className="w-6 h-6" />,
  security: <Lock className="w-6 h-6" />,
  internet: <Wifi className="w-6 h-6" />,
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<ListingDetail | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const listingId = params.id;
  const isOwner = listing && user && listing.owner === user.id;

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
        setError("Could not load listing details");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.delete(`/rent-listings/${listingId}/`);
      router.push("/");
    } catch (err) {
      setError("Failed to delete listing");
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEdit = () => {
    if (listing) {
      setEditForm({ ...listing });
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = async () => {
    if (!editForm) return;

    try {
      setIsSaving(true);
      const payload = {
        property_type: editForm.property_type,
        property_type_other: editForm.property_type_other,
        description: editForm.description,
        location: editForm.location,
        bedrooms: editForm.bedrooms,
        bathrooms: editForm.bathrooms,
        amenities: editForm.amenities,
        photos: editForm.photos,
        monthly_rent: editForm.monthly_rent,
        currency: editForm.currency,
        initial_deposit: editForm.initial_deposit,
        negotiable: editForm.negotiable,
        phone_number: editForm.phone_number,
      };

      const response = await api.patch(`/rent-listings/${listingId}/`, payload);
      const updatedListing = response.data;
      setListing(updatedListing);
      setShowEditModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <ListingDetailSkeleton />;
  }

  if (error || !listing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">{error || "Listing not found"}</p>
        <Button onClick={() => router.push("/")} variant="outline">
          Back to Listings
        </Button>
      </div>
    );
  }

  const photos =
    listing.photos && listing.photos.length > 0
      ? listing.photos
      : ["/placeholder.svg"];
  const propertyType = listing.property_type_other || listing.property_type;
  const monthlyRent = Number.parseInt(listing.monthly_rent);
  const hostName = listing.owner_details
    ? `${listing.owner_details.first_name} ${listing.owner_details.last_name}`
    : "Host";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-lg transition-colors text-foreground">
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
            <button
              onClick={() => setIsFavorite(!isFavorite)}
              className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? "fill-current text-rose-500" : ""
                }`}
              />
              <span className="text-sm font-medium">Save</span>
            </button>
            {isOwner && (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Edit</span>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Delete</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-muted h-96 lg:h-96">
            <img
              src={photos[currentImageIndex] || "/placeholder.svg"}
              alt={`Property image ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              onClick={() =>
                setCurrentImageIndex(
                  (p) => (p - 1 + photos.length) % photos.length
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 transition-all shadow-md"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() =>
                setCurrentImageIndex((p) => (p + 1) % photos.length)
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 transition-all shadow-md"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            {photos.length > 1 && (
              <button
                onClick={() => router.push(`/listings/${listingId}/photos`)}
                className="absolute bottom-4 right-4 bg-black/80 hover:bg-black text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm font-medium"
              >
                <Grid3x3 className="w-4 h-4" />
                Show all photos
              </button>
            )}
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-3 h-96">
            {photos.slice(0, 4).map((photo, idx) => (
              <div
                key={idx}
                className={`rounded-lg overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity ${
                  idx === 3 && photos.length > 4 ? "relative" : ""
                }`}
                onClick={() => setCurrentImageIndex(idx)}
              >
                <img
                  src={photo || "/placeholder.svg"}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                {idx === 3 && photos.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-semibold">
                    +{photos.length - 4} more
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h1 className="text-base font-bold text-foreground mb-2">
                {listing.description || propertyType}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {listing.bedrooms} bed · {listing.bathrooms} bath
              </p>
              <p className="text-base text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {listing.location}
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                What this place offers
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {listing.amenities && listing.amenities.length > 0 ? (
                  listing.amenities.slice(0, 8).map((amenity) => (
                    <div key={amenity} className="flex items-start gap-4">
                      <div className="text-2xl mt-1">
                        {amenityIcons[amenity.toLowerCase()] || "✓"}
                      </div>
                      <span className="text-foreground font-medium capitalize">
                        {amenity.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-2">
                    No amenities listed
                  </p>
                )}
              </div>
            </div>

            {listing.description && (
              <div className="border-t border-border pt-6">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  About this property
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}

            <div className="border-t border-border pt-6">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Meet your host
              </h3>
              <div className="flex items-start gap-6 bg-gradient-to-r from-gray-50 to-white border border-border rounded-2xl p-6">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-3">
                    {hostName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-foreground mb-1">
                    {hostName}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {listing.owner_details?.email || "Host email"}
                  </p>
                  <button className="mt-4 px-6 py-2 border border-border rounded-lg text-foreground font-medium hover:bg-muted transition-colors flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Message host
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Where you'll be
              </h3>
              <p className="text-base text-muted-foreground mb-4">
                {listing.location}
              </p>
              <div className="rounded-2xl overflow-hidden border border-border h-80 bg-muted">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyA0pBkfNjrpM4_vLQvC5-sKNbwXTYb5P_A&q=${encodeURIComponent(
                    listing.location
                  )}`}
                ></iframe>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-border rounded-2xl p-6 shadow-lg space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Price per month
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {listing.currency}{" "}
                  <span className="underline">
                    {monthlyRent.toLocaleString()}
                  </span>
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 border border-border rounded-lg overflow-hidden">
                  <div className="border-r border-border p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Available from
                    </p>
                    <p className="text-sm font-medium text-foreground">Now</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      Lease term
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      Flexible
                    </p>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${listing.phone_number}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold transition-colors"
              >
                <Phone className="w-4 h-4" />
                Contact Owner
              </a>

              {listing.initial_deposit && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Initial Deposit
                  </p>
                  <p className="font-semibold text-foreground">
                    {listing.currency}{" "}
                    {Number.parseInt(listing.initial_deposit).toLocaleString()}
                  </p>
                </div>
              )}

              {listing.negotiable && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm font-medium text-green-600">
                    Price negotiable
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Listing</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Are you sure you want to delete this listing? This action cannot be
            undone.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={editForm.bedrooms}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        bedrooms: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={editForm.bathrooms}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        bathrooms: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthly_rent">Monthly Rent</Label>
                  <Input
                    id="monthly_rent"
                    value={editForm.monthly_rent}
                    onChange={(e) =>
                      setEditForm({ ...editForm, monthly_rent: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={editForm.currency}
                    onChange={(e) =>
                      setEditForm({ ...editForm, currency: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={editForm.phone_number}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone_number: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
