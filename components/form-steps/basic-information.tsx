"use client"

interface BasicInformationFormProps {
  formData: {
    propertyType: string
    customPropertyType: string
    description: string
    location: string
  }
  updateFormData: (updates: Record<string, string>) => void
}

const PROPERTY_TYPES = [
  { label: "House", value: "house", amharic: "መኖርያ ቤት" },
  { label: "Apartment", value: "apartment", amharic: "አፓርታማ" },
  { label: "Warehouse", value: "warehouse", amharic: "መጋዘን" },
  { label: "Office", value: "office", amharic: "ቢሮ" },
  { label: "Other", value: "other", amharic: "ሌላ" },
]

export default function BasicInformationForm({ formData, updateFormData }: BasicInformationFormProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Basic Information</h2>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Property Type</label>
        <select
          value={formData.propertyType}
          onChange={(e) => updateFormData({ propertyType: e.target.value, customPropertyType: "" })}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        >
          <option value="">Select property type</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label} ({type.amharic})
            </option>
          ))}
        </select>
      </div>

      {/* Custom Property Type */}
      {formData.propertyType === "other" && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Specify Property Type</label>
          <input
            type="text"
            value={formData.customPropertyType}
            onChange={(e) => updateFormData({ customPropertyType: e.target.value })}
            placeholder="Enter property type"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
          />
        </div>
      )}

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => updateFormData({ location: e.target.value })}
          placeholder="Enter property location"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Description (Optional)</label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="Describe your property..."
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
        />
      </div>
    </div>
  )
}
