// Telegram Message Formatter Service

interface ListingData {
  id?: number;
  property_type: string;
  property_type_other?: string | null;
  description: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  photos: string[];
  monthly_rent: string;
  currency: string;
  initial_deposit?: string | null;
  negotiable: boolean;
  phone_number: string;
}

const AMENITY_EMOJIS: Record<string, string> = {
  water: "💧",
  electricity: "⚡",
  security: "🔒",
  internet: "📡",
  wifi: "📡",
  parking: "🅿️",
  gym: "🏋️",
  pool: "🏊",
  garden: "🌳",
  balcony: "🏞️",
};

export class TelegramMessageFormatter {
  /**
   * Format listing data into a Telegram message
   */
  static formatListingMessage(listing: ListingData): string {
    const propertyType = listing.property_type_other || listing.property_type;
    const monthlyRent = Number.parseInt(listing.monthly_rent);
    
    // Build the message
    let message = `🏠 <b>${listing.description || propertyType}</b>\n\n`;
    
    // Location
    message += `📍 <b>Location:</b> ${listing.location}\n`;
    
    // Bedrooms and Bathrooms
    message += `🛏️ <b>Bedrooms:</b> ${listing.bedrooms} | 🚿 <b>Bathrooms:</b> ${listing.bathrooms}\n`;
    
    // Price
    message += `💰 <b>Price:</b> ${listing.currency} ${monthlyRent.toLocaleString()}/month`;
    if (listing.negotiable) {
      message += ` <i>(Negotiable)</i>`;
    }
    message += `\n`;
    
    // Initial Deposit
    if (listing.initial_deposit) {
      const deposit = Number.parseInt(listing.initial_deposit);
      message += `💵 <b>Deposit:</b> ${listing.currency} ${deposit.toLocaleString()}\n`;
    }
    
    // Amenities
    if (listing.amenities && listing.amenities.length > 0) {
      message += `\n✨ <b>Amenities:</b>\n`;
      listing.amenities.forEach((amenity) => {
        const emoji = AMENITY_EMOJIS[amenity.toLowerCase()] || "✓";
        const displayName = amenity.replace(/_/g, " ");
        message += `${emoji} ${displayName}\n`;
      });
    }
    
    // Property Type
    message += `\n🏷️ <b>Type:</b> ${propertyType}`;
    
    return message;
  }

  /**
   * Create inline keyboard for listing message
   * Uses standard URL buttons that open in Telegram's in-app browser
   */
  static createListingKeyboard(listingId?: number, phoneNumber?: string) {
    // Detailed Deep Link for Mini App (using t.me link as requested)
    // Note: startapp param supports a-zA-Z0-9_- only. Slashes are not allowed.
    // We format as 'listing-<id>' or 'contact-<id>'
    const botAppName = "melahomesforethiopiabot/melahomes";
    const deepLinkBase = `https://t.me/${botAppName}`;
    
    const keyboard = [];
    
    // First row: Contact Info button (Deep Link)
    if (phoneNumber && listingId) {
      keyboard.push([
        {
          text: "📞 Contact Info",
          url: `${deepLinkBase}?startapp=contact-${listingId}`,
        },
      ]);
    }
    
    // Second row: View Details button (Deep Link)
    if (listingId) {
      keyboard.push([
        {
          text: "🔍 View Details",
          url: `${deepLinkBase}?startapp=listing-${listingId}`,
        },
      ]);
    }

    // Third row: Post a Listing button (Deep Link)
    keyboard.push([
      {
        text: "➕ Post Your Property",
        url: `${deepLinkBase}?startapp=create-listing`,
      },
    ]);
    
    return {
      inline_keyboard: keyboard,
    };
  }

  /**
   * Format contact information message
   */
  static formatContactMessage(phoneNumber: string, propertyDescription: string): string {
    return `📱 <b>Contact Information</b>\n\n` +
           `Property: ${propertyDescription}\n` +
           `Phone: <code>${phoneNumber}</code>\n\n` +
           `<i>Click the phone number to copy it.</i>`;
  }

  /**
   * Create photo caption for media group
   */
  static formatPhotoCaption(listing: ListingData, photoIndex: number, totalPhotos: number): string {
    if (photoIndex === 0) {
      // First photo gets the full caption
      return this.formatListingMessage(listing);
    }
    // Other photos get minimal caption
    return `Photo ${photoIndex + 1}/${totalPhotos}`;
  }
}
