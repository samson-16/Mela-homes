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

import { PROPERTY_TYPES } from "@/lib/constants"

export default function BasicInformationForm({ formData, updateFormData }: BasicInformationFormProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">መሰረታዊ መረጃ</h2>

      {/* Property Type */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">የንብረት አይነት</label>
        <select
          value={formData.propertyType}
          onChange={(e) => updateFormData({ propertyType: e.target.value, customPropertyType: "" })}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        >
          <option value="">የንብረት አይነት ይምረጡ</option>
          {PROPERTY_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.amharic}
            </option>
          ))}
        </select>
      </div>

      {/* Custom Property Type */}
      {formData.propertyType === "other" && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">የንብረት አይነት ይግለጹ</label>
          <input
            type="text"
            value={formData.customPropertyType}
            onChange={(e) => updateFormData({ customPropertyType: e.target.value })}
            placeholder="የንብረት አይነት ያስገቡ"
            className="w-full px-3 py-2 border border-border rounded-lg bg-background"
          />
        </div>
      )}

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">ቦታ</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => updateFormData({ location: e.target.value })}
          placeholder="የንብረት ቦታ ያስገቡ"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">መግለጫ (አማራጭ)</label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          placeholder="ስለ ንብረቱ ይግለጹ..."
          rows={4}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background resize-none"
        />
      </div>
    </div>
  )
}
