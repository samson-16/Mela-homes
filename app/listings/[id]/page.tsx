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
  Grid3x3,
  MessageCircle,
  Edit2,
  Trash2,
} from "lucide-react";
import { useTelegram } from "@/lib/telegram-provider";
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
import dynamic from "next/dynamic";
import { AMENITIES, PROPERTY_TYPES } from "@/lib/constants";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground text-sm">ካርታው እየጫነ ነው...</p>
    </div>
  ),
});

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
  pool: <Droplet className="w-6 h-6" />, // Fallback for pool
  parking: <Grid3x3 className="w-6 h-6" />, // Fallback for parking
  gym: <Zap className="w-6 h-6" />, // Fallback for gym
};

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { isMiniApp: isTelegram, webApp } = useTelegram();

  // Telegram BackButton logic
  useEffect(() => {
    if (isTelegram && webApp?.BackButton) {
      webApp.BackButton.show();
      const handleBack = () => {
        router.push("/");
      };
      webApp.BackButton.onClick(handleBack);
      
      return () => {
        webApp.BackButton.hide();
        webApp.BackButton.offClick(handleBack);
      };
    }
  }, [isTelegram, webApp, router]);

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
        setError("ንብረቱን ማምጣት አልተቻለም");
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
      setError("ንብረቱን መሰረዝ አልተቻለም");
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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1024;
          const MAX_HEIGHT = 1024;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressedBase64);
        };
      };
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && editForm) {
      const newPhotos = [...(editForm.photos || [])];
      for (let i = 0; i < files.length; i++) {
        const base64 = await compressImage(files[i]);
        newPhotos.push(base64);
      }
      setEditForm({ ...editForm, photos: newPhotos });
    }
  };

  const removePhotoFromEdit = (index: number) => {
    if (editForm) {
      const newPhotos = editForm.photos.filter((_, i) => i !== index);
      setEditForm({ ...editForm, photos: newPhotos });
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
        amenities: JSON.stringify(editForm.amenities),
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
      setError(err instanceof Error ? err.message : "ማስተካከል አልተቻለም");
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
        <p className="text-muted-foreground">{error || "ንብረት አልተገኘም"}</p>
        <Button onClick={() => router.push("/")} variant="outline">
          ወደ ዝርዝር ተመለስ
        </Button>
      </div>
    );
  }

  const photos =
    listing.photos && listing.photos.length > 0
      ? listing.photos
      : ["/placeholder.svg"];
  const standardType = PROPERTY_TYPES.find(t => t.value === listing.property_type);
  const propertyType = listing.property_type_other || (standardType ? standardType.amharic : listing.property_type);
  const monthlyRent = Number.parseInt(listing.monthly_rent);
  const hostName = listing.owner_details
    ? `${listing.owner_details.first_name} ${listing.owner_details.last_name}`
    : "አስተናጋጅ";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 
              className="text-xl font-bold cursor-pointer" 
              onClick={() => router.push("/")}
            >
              Mela Homes
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <button
                  onClick={handleEdit}
                  className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
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
                ሁሉንም ፎቶዎች አሳይ
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
                    +{photos.length - 4} ተጨማሪ
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
                {listing.bedrooms} መኝታ · {listing.bathrooms} መታጠቢያ
              </p>
              <p className="text-base text-muted-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {listing.location}
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                የንብረቱ ዝርዝሮች
              </h3>
              <div className="grid grid-cols-2 gap-6">
                {listing.amenities && listing.amenities.length > 0 ? (
                  listing.amenities.slice(0, 8).map((amenity) => (
                    <div key={amenity} className="flex items-start gap-4">
                      <div className="text-2xl mt-1">
                        {amenityIcons[amenity.toLowerCase()] || "✓"}
                      </div>
                      <span className="text-foreground font-medium capitalize">
                        {AMENITIES.find(a => a.value === amenity)?.amharic || amenity.replace(/_/g, " ")}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-2">
                    ምንም የተገለጸ የለም
                  </p>
                )}
              </div>
            </div>

            {listing.description && (
              <div className="border-t border-border pt-6">
                <h3 className="text-2xl font-bold text-foreground mb-4">
                  ስለዚህ ንብረት
                </h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  {listing.description}
                </p>
              </div>
            )}

            <div className="border-t border-border pt-6">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                አስተናጋጅዎን ይወቁ
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
                    {listing.owner_details?.email || "የአስተናጋጅ ኢሜይል"}
                  </p>
                  <button className="mt-4 px-6 py-2 border border-border rounded-lg text-foreground font-medium hover:bg-muted transition-colors flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    አስተናጋጁን ያናግሩ
                  </button>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                የቦታው አቀማመጥ
              </h3>
              <p className="text-base text-muted-foreground mb-4">
                {listing.location}
              </p>
              <div className="rounded-2xl overflow-hidden border border-border h-80 bg-muted">
                <Map location={listing.location} />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white border border-border rounded-2xl p-6 shadow-lg space-y-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  ወርሃዊ ዋጋ
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
                      ከዚህ ቀን ጀምሮ ይገኛል
                    </p>
                    <p className="text-sm font-medium text-foreground">አሁን</p>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                      የኪራይ ውል
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      ተለዋዋጭ
                    </p>
                  </div>
                </div>
              </div>

              <a
                href={`tel:${listing.phone_number}`}
                className="flex items-center justify-center gap-2 w-full py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold transition-colors"
              >
                <Phone className="w-4 h-4" />
                ባለቤቱን ያናግሩ
              </a>

              {listing.initial_deposit && (
                <div className="border-t border-border pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    የመጀመሪያ ቅድመ ክፍያ
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
                    ዋጋው ድርድር አለው
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
            <DialogTitle>ንብረቱን ይሰርዙ</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            ይህን ንብረት በእርግጠኝነት መሰረዝ ይፈልጋሉ? ይህን እርምጃ መመለስ አይቻልም።
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              አቋርጥ
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "እየተሰረዘ ነው..." : "ሰርዝ"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ንብረቱን ያስተካክሉ</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="property_type">የንብረት አይነት</Label>
                  <select
                    id="property_type"
                    value={editForm.property_type}
                    onChange={(e) =>
                      setEditForm((prev) =>
                        prev ? { ...prev, property_type: e.target.value, property_type_other: e.target.value === "other" ? prev.property_type_other : "" } : null
                      )
                    }
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.amharic}
                      </option>
                    ))}
                  </select>
                </div>
                {editForm.property_type === "other" && (
                  <div>
                    <Label htmlFor="property_type_other">የንብረት አይነት ይግለጹ</Label>
                    <Input
                      id="property_type_other"
                      value={editForm.property_type_other || ""}
                      onChange={(e) =>
                        setEditForm((prev) => (prev ? { ...prev, property_type_other: e.target.value } : null))
                      }
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="description">መግለጫ</Label>
                <Input
                  id="description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((prev) => (prev ? { ...prev, description: e.target.value } : null))
                  }
                />
              </div>
              <div>
                <Label htmlFor="location">ቦታ</Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm((prev) => (prev ? { ...prev, location: e.target.value } : null))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedrooms">መኝታ ቤቶች</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={editForm.bedrooms}
                    onChange={(e) =>
                      setEditForm((prev) =>
                        prev ? { ...prev, bedrooms: parseInt(e.target.value) || 0 } : null
                      )
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">መታጠቢያ ቤቶች</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={editForm.bathrooms}
                    onChange={(e) =>
                      setEditForm((prev) =>
                        prev ? { ...prev, bathrooms: parseInt(e.target.value) || 0 } : null
                      )
                    }
                  />
                </div>
              </div>
              <div>
                <Label>ተጨማሪዎች (Amenities)</Label>
                <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
                  {AMENITIES.map((amenity) => (
                    <div key={amenity.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`edit-amenity-${amenity.value}`}
                        checked={(editForm.amenities || []).includes(amenity.value)}
                        onChange={(e) => {
                          const current = editForm.amenities || [];
                          const updated = e.target.checked
                            ? [...current, amenity.value]
                            : current.filter((a) => a !== amenity.value);
                          setEditForm((prev) => (prev ? { ...prev, amenities: updated } : null));
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <Label htmlFor={`edit-amenity-${amenity.value}`} className="text-sm font-normal cursor-pointer">
                        {amenity.amharic}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthly_rent">ወርሃዊ ኪራይ</Label>
                  <Input
                    id="monthly_rent"
                    value={editForm.monthly_rent}
                    onChange={(e) =>
                      setEditForm((prev) => (prev ? { ...prev, monthly_rent: e.target.value } : null))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="currency">ምንዛሬ</Label>
                  <select
                    id="currency"
                    value={editForm.currency}
                    onChange={(e) =>
                      setEditForm((prev) => (prev ? { ...prev, currency: e.target.value } : null))
                    }
                    className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {["USD", "EUR", "GBP", "ETB", "KES", "UGX"].map((curr) => (
                      <option key={curr} value={curr}>
                        {curr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <Label htmlFor="initial_deposit">የመጀመሪያ ቅድመ ክፍያ (Initial Deposit)</Label>
                <Input
                  id="initial_deposit"
                  value={editForm.initial_deposit || ""}
                  onChange={(e) =>
                    setEditForm((prev) => (prev ? { ...prev, initial_deposit: e.target.value } : null))
                  }
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit-negotiable"
                  checked={editForm.negotiable}
                  onChange={(e) =>
                    setEditForm((prev) => (prev ? { ...prev, negotiable: e.target.checked } : null))
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="edit-negotiable" className="text-sm font-normal cursor-pointer">
                  ድርድር አለው
                </Label>
              </div>
              <div>
                <Label>ፎቶዎች</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(editForm.photos || []).map((photo, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={photo}
                        alt={`Preview ${index}`}
                        className="w-full h-full object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={() => removePhotoFromEdit(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="border-2 border-dashed border-muted rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors aspect-square">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <Grid3x3 className="w-6 h-6 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground mt-1">ፎቶ ይጨምሩ</span>
                  </label>
                </div>
              </div>
              <div>
                <Label htmlFor="phone_number">ስልክ ቁጥር</Label>
                <Input
                  id="phone_number"
                  value={editForm.phone_number}
                  onChange={(e) =>
                    setEditForm((prev) => (prev ? { ...prev, phone_number: e.target.value } : null))
                  }
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditModal(false)}
                >
                  አቋርጥ
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                >
                  {isSaving ? "እየተስተካከለ ነው..." : "ለውጦችን አስቀምጥ"}
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
