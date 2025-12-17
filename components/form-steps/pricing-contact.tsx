"use client"

interface PricingContactFormProps {
  formData: {
    monthlyRent: number
    currency: string
    deposit: number
    negotiable: boolean
    phoneNumber: string
  }
  updateFormData: (updates: Record<string, any>) => void
}

const CURRENCIES = ["USD", "EUR", "GBP", "ETB", "KES", "UGX"]

export default function PricingContactForm({ formData, updateFormData }: PricingContactFormProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">ዋጋ እና አድራሻ</h2>

      {/* Monthly Rent */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">ወርሃዊ ኪራይ ዋጋ</label>
        <input
          type="number"
          min="0"
          value={formData.monthlyRent}
          onChange={(e) => updateFormData({ monthlyRent: Number.parseFloat(e.target.value) || 0 })}
          placeholder="ወርሃዊ ኪራይ ያስገቡ"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        />
      </div>

      {/* Currency */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">ለምንዛሬ</label>
        <select
          value={formData.currency}
          onChange={(e) => updateFormData({ currency: e.target.value })}
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        >
          {CURRENCIES.map((curr) => (
            <option key={curr} value={curr}>
              {curr}
            </option>
          ))}
        </select>
      </div>

      {/* Initial Deposit */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">የመጀመሪያ ቅድመ ክፍያ (አማራጭ)</label>
        <input
          type="number"
          min="0"
          value={formData.deposit}
          onChange={(e) => updateFormData({ deposit: Number.parseFloat(e.target.value) || 0 })}
          placeholder="የቅድመ ክፍያ መጠን ያስገቡ"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        />
      </div>

      {/* Price Negotiable */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="negotiable"
          checked={formData.negotiable}
          onChange={(e) => updateFormData({ negotiable: e.target.checked })}
          className="rounded border-border"
        />
        <label htmlFor="negotiable" className="text-sm font-medium text-foreground cursor-pointer">
          ዋጋው ድርድር አለው
        </label>
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">ስልክ ቁጥር</label>
        <input
          type="tel"
          value={formData.phoneNumber}
          onChange={(e) => updateFormData({ phoneNumber: e.target.value })}
          placeholder="ስልክ ቁጥር ያስገቡ"
          className="w-full px-3 py-2 border border-border rounded-lg bg-background"
        />
      </div>
    </div>
  )
}
