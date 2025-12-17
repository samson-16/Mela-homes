"use client";

import { useState } from "react";
import { X, ChevronLeft } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import BasicInformationForm from "./form-steps/basic-information";
import PropertyFeaturesForm from "./form-steps/property-feature";
import PhotoUploadForm from "./form-steps/photo-upload";
import PricingContactForm from "./form-steps/pricing-contact";

interface ListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STEP_TITLES = [
  "መሰረታዊ መረጃ",
  "የንብረት ባህሪያት",
  "ፎቶዎችን ይስቀሉ",
  "ዋጋ እና አድራሻ",
];

export default function ListingFormModal({
  isOpen,
  onClose,
  onSuccess,
}: ListingFormModalProps) {
  const { token } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  /* State initialization with Base64 photos array */
  const [formData, setFormData] = useState({
    propertyType: "",
    customPropertyType: "",
    description: "",
    location: "",
    bedrooms: 0,
    bathrooms: 0,
    amenities: [] as string[],
    photos: [] as string[], // Reverted to string[] (Base64)
    monthlyRent: 0,
    currency: "USD",
    deposit: 0,
    negotiable: false,
    phoneNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep === 1) {
      onClose();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  /* Helper to convert Base64 to Blob for file upload */
  const dataURLtoBlob = (dataurl: string) => {
    const arr = dataurl.split(",");
    const match = arr[0].match(/:(.*?);/);
    const mime = match ? match[1] : "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      const formDataPayload = new FormData();
      formDataPayload.append("property_type", formData.propertyType);
      if (formData.customPropertyType) {
        formDataPayload.append("property_type_other", formData.customPropertyType);
      }
      formDataPayload.append("description", formData.description);
      formDataPayload.append("location", formData.location);
      formDataPayload.append("bedrooms", formData.bedrooms.toString());
      formDataPayload.append("bathrooms", formData.bathrooms.toString());
      
      // Append amenities individually
      formData.amenities.forEach((amenity) => {
        formDataPayload.append("amenities", amenity);
      });

      // Convert and append photos
      formData.photos.forEach((photoBase64, index) => {
        const blob = dataURLtoBlob(photoBase64);
        formDataPayload.append("photos", blob, `photo-${index}.jpg`);
      });

      formDataPayload.append("monthly_rent", formData.monthlyRent.toString());
      formDataPayload.append("currency", formData.currency);
      if (formData.deposit) {
        formDataPayload.append("initial_deposit", formData.deposit.toString());
      }
      formDataPayload.append("negotiable", formData.negotiable ? "true" : "false");
      formDataPayload.append("phone_number", formData.phoneNumber);

      // Post to backend API
      const response = await api.post("/rent-listings/", formDataPayload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const createdListing = response.data;

      // Post to Telegram channel (non-blocking)
      try {
        const responseData = createdListing.data || createdListing;
        
        // Reconstruct simple object for Telegram service (since we can't spread FormData)
        const telegramPayload = {
          property_type: formData.propertyType,
          property_type_other: formData.customPropertyType || null,
          description: formData.description,
          location: formData.location,
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          amenities: formData.amenities,
          monthly_rent: formData.monthlyRent.toString(),
          currency: formData.currency,
          initial_deposit: formData.deposit ? formData.deposit.toString() : null,
          negotiable: formData.negotiable,
          phone_number: formData.phoneNumber,
          
          id: responseData.id,
          // Use backend URLs from the response
          photos: responseData.photos || [],
        };

        const telegramResponse = await fetch("/api/telegram/post-listing", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(telegramPayload),
        });

        const telegramResult = await telegramResponse.json();

        if (!telegramResult.success && !telegramResult.skipped) {
          console.warn("Failed to post to Telegram:", telegramResult.error);
        }
      } catch (telegramError) {
        console.error("Error posting to Telegram:", telegramError);
      }

      onSuccess();
    } catch (err: any) {
      console.error("Submission Error:", err);
      let errorMessage = "ንብረቱን መመዝገብ አልተቻለም"; // Failed to create listing
      
      if (err.response?.data) {
        const errorData = err.response.data;
        // Check if errorData is an object and not null
        if (typeof errorData === "object" && errorData !== null) {
          // If it's an array (e.g. non-field errors), join them
          if (Array.isArray(errorData)) {
             errorMessage = errorData.join(", ");
          } else {
             // It's an object of field errors
             const errors = Object.entries(errorData)
              .map(([field, msgs]) => {
                const message = Array.isArray(msgs) ? msgs[0] : JSON.stringify(msgs);
                return `${field}: ${message}`;
              })
              .join(", ");
             if (errors) errorMessage = errors;
          }
        } else if (typeof errorData === "string") {
            errorMessage = errorData;
        }
      } else if (err.message) {
          errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                ንብረት ያስመዝግቡ
              </h1>
              <p className="text-sm text-muted-foreground">
                ደረጃ {currentStep} ከ 4: {STEP_TITLES[currentStep - 1]}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Content */}
      <main
        className="max-w-3xl mx-auto px-4 py-8 pb-32 overflow-y-auto"
        style={{ height: "calc(100vh - 80px)" }}
      >
        {/* Step Indicators */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                  currentStep > step
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step ? "✓" : step}
              </div>
              {step < 4 && (
                <div
                  className={`w-16 md:w-24 h-1 mx-2 transition-colors ${
                    currentStep > step ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl border border-border p-6 md:p-8">
          {currentStep === 1 && (
            <BasicInformationForm
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 2 && (
            <PropertyFeaturesForm
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 3 && (
            <PhotoUploadForm
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
          {currentStep === 4 && (
            <PricingContactForm
              formData={formData}
              updateFormData={updateFormData}
            />
          )}
        </div>
      </main>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            {currentStep === 1 ? "አቋርጥ" : "ተመለስ"}
          </Button>

          {currentStep < 4 ? (
            <Button onClick={handleNext} className="px-8">
              ቀጥል
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8"
            >
              {isSubmitting ? "እየተላከ ነው..." : "ንብረቱንለጥፍ"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
