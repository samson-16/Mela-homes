"use client"

interface PropertyFeaturesFormProps {
  formData: {
    bedrooms: number
    bathrooms: number
    amenities: string[]
  }
  updateFormData: (updates: Record<string, any>) => void
}

const AMENITIES = [
  { label: "Water", value: "water", amharic: "ውሃ" },
  { label: "Electricity", value: "electricity", amharic: "ኤሌክትሪክ" },
  { label: "Security", value: "security", amharic: "የጥበቃ አገልግሎት" },
  { label: "Elevator", value: "elevator", amharic: "ሊፍት" },
  { label: "Swimming Pool", value: "pool", amharic: "የመዋኛ ገንዳ" },
  { label: "Internet", value: "internet", amharic: "ኢንተርኔት" },
  { label: "Parking", value: "parking", amharic: "ፓርኪንግ" },
  { label: "Generator", value: "generator", amharic: "ጀነሬተር" },
  { label: "Garden", value: "garden", amharic: "ጋርደን" },
]

export default function PropertyFeaturesForm({ formData, updateFormData }: PropertyFeaturesFormProps) {
  const handleAmenityToggle = (value: string) => {
    const newAmenities = formData.amenities.includes(value)
      ? formData.amenities.filter((a) => a !== value)
      : [...formData.amenities, value]
    updateFormData({ amenities: newAmenities })
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Property Features</h2>

      {/* Bedrooms */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Bedrooms</label>
        <input
          type="number"
          min="0"
          value={formData.bedrooms}
          onChange={(e) => updateFormData({ bedrooms: Number.parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        />
      </div>

      {/* Bathrooms */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Bathrooms</label>
        <input
          type="number"
          min="0"
          value={formData.bathrooms}
          onChange={(e) => updateFormData({ bathrooms: Number.parseInt(e.target.value) || 0 })}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        />
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">Amenities</label>
        <div className="grid grid-cols-2 gap-3">
          {AMENITIES.map((amenity) => (
            <label key={amenity.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.amenities.includes(amenity.value)}
                onChange={() => handleAmenityToggle(amenity.value)}
                className="rounded border-border"
              />
              <span className="text-sm text-foreground">
                {amenity.label} <span className="text-xs text-muted-foreground">({amenity.amharic})</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
