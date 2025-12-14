"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Mail, LogOut, Edit2, Trash2 } from "lucide-react";
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

interface UserListing {
  id: number;
  property_type: string;
  property_type_other: string | null;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  monthly_rent: string;
  currency: string;
  initial_deposit: string | null;
  negotiable: boolean;
  phone_number: string;
  photos: string[];
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, token, logout, isLoading, refreshToken } = useAuth();
  const [userListings, setUserListings] = useState<UserListing[]>([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingListing, setEditingListing] = useState<UserListing | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/");
    }
  }, [isLoading, token, router]);

  useEffect(() => {
    if (token && user) {
      fetchUserListings();
    }
  }, [token, user]);

  const fetchUserListings = async () => {
    try {
      setLoadingListings(true);
      setError(null);

      const response = await api.get("/rent-listings/");
      const data = response.data;
      const listings = Array.isArray(data)
        ? data
        : data.results || data.data || [];
      const myListings = listings.filter(
        (listing: UserListing & { owner: number }) => listing.owner === user?.id
      );
      setUserListings(myListings);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
      setError("Failed to fetch listings");
    } finally {
      setLoadingListings(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this listing?"))
      return;

    try {
      setIsDeleting(id);
      setError(null);
      await api.delete(`/rent-listings/${id}/`);

      setUserListings((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleUpdate = async () => {
    if (!editingListing) return;

    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        property_type: editingListing.property_type,
        property_type_other: editingListing.property_type_other,
        description: editingListing.description,
        location: editingListing.location,
        bedrooms: editingListing.bedrooms,
        bathrooms: editingListing.bathrooms,
        amenities: editingListing.amenities,
        photos: editingListing.photos,
        monthly_rent: editingListing.monthly_rent,
        currency: editingListing.currency,
        initial_deposit: editingListing.initial_deposit,
        negotiable: editingListing.negotiable,
        phone_number: editingListing.phone_number,
      };

      const response = await api.patch(
        `/rent-listings/${editingListing.id}/`,
        payload
      );
      const updatedListing = response.data;
      setUserListings((prev) =>
        prev.map((l) => (l.id === editingListing.id ? updatedListing : l))
      );
      setEditingListing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-foreground">My Profile</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {user.first_name?.charAt(0).toUpperCase() ||
                user.username?.charAt(0).toUpperCase() ||
                "U"}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-muted-foreground mb-4">@{user.username}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* My Listings */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-foreground mb-4">
            My Listings
          </h3>
          {loadingListings ? (
            <p className="text-muted-foreground">Loading your listings...</p>
          ) : userListings.length === 0 ? (
            <div className="bg-muted/50 rounded-xl p-8 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't posted any listings yet.
              </p>
              <Button onClick={() => router.push("/")}>
                Post Your First Listing
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {userListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white border border-border rounded-xl p-4 flex gap-4"
                >
                  <img
                    src={
                      listing.photos[0] 
                    }
                    alt={listing.description}
                    className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                    onClick={() => router.push(`/listings/${listing.id}`)}
                  />
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => router.push(`/listings/${listing.id}`)}
                  >
                    <h4 className="font-semibold text-foreground">
                      {listing.description || listing.property_type}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {listing.location}
                    </p>
                    <p className="text-sm font-semibold text-foreground mt-2">
                      {listing.currency}{" "}
                      {Number(listing.monthly_rent).toLocaleString()} / month
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingListing(listing);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      disabled={isDeleting === listing.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(listing.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </Button>
      </main>

      {/* Edit Modal */}
      <Dialog
        open={!!editingListing}
        onOpenChange={() => setEditingListing(null)}
      >
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          {editingListing && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editingListing.description}
                  onChange={(e) =>
                    setEditingListing({
                      ...editingListing,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editingListing.location}
                  onChange={(e) =>
                    setEditingListing({
                      ...editingListing,
                      location: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={editingListing.bedrooms}
                    onChange={(e) =>
                      setEditingListing({
                        ...editingListing,
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
                    value={editingListing.bathrooms}
                    onChange={(e) =>
                      setEditingListing({
                        ...editingListing,
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
                    value={editingListing.monthly_rent}
                    onChange={(e) =>
                      setEditingListing({
                        ...editingListing,
                        monthly_rent: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={editingListing.currency}
                    onChange={(e) =>
                      setEditingListing({
                        ...editingListing,
                        currency: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={editingListing.phone_number}
                  onChange={(e) =>
                    setEditingListing({
                      ...editingListing,
                      phone_number: e.target.value,
                    })
                  }
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditingListing(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpdate}
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
