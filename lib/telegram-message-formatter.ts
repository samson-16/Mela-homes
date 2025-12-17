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

import { AMENITIES } from "@/lib/constants";

const AMENITY_EMOJIS: Record<string, string> = {
  water: "💧",
  electricity: "⚡",
  security: "🔒",
  elevator: "🛗",
  pool: "🏊",
  internet: "📡",
  wifi: "📡",
  parking: "🅿️",
  generator: "🔋",
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
    message += `📍 <b>ቦታ:</b> ${listing.location}\n`;
    
    // Bedrooms and Bathrooms
    message += `🛏️ <b>መኝታ ቤቶች:</b> ${listing.bedrooms} | 🚿 <b>መታጠቢያ ቤቶች:</b> ${listing.bathrooms}\n`;
    
    // Price
    message += `💰 <b>ዋጋ:</b> ${listing.currency} ${monthlyRent.toLocaleString()}/ወር`;
    if (listing.negotiable) {
      message += ` <i>(ድርድር አለው)</i>`;
    }
    message += `\n`;
    
    // Initial Deposit
    if (listing.initial_deposit) {
      const deposit = Number.parseInt(listing.initial_deposit);
      message += `💵 <b>ቅድመ ክፍያ:</b> ${listing.currency} ${deposit.toLocaleString()}\n`;
    }
    
    // Amenities
    if (listing.amenities && listing.amenities.length > 0) {
      message += `\n✨ <b>ተጨማሪዎች:</b>\n`;
      listing.amenities.forEach((amenity) => {
        const emoji = AMENITY_EMOJIS[amenity.toLowerCase()] || "✓";
        const amenityObj = AMENITIES.find(a => a.value === amenity);
        const displayName = amenityObj ? amenityObj.amharic : amenity.replace(/_/g, " ");
        message += `${emoji} ${displayName}\n`;
      });
    }
    
    // Property Type
    message += `\n🏷️ <b>አይነት:</b> ${propertyType}`;
    
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
          text: "📞 አድራሻ",
          url: `${deepLinkBase}?startapp=contact-${listingId}`,
        },
      ]);
    }
    
    // Second row: View Details button (Deep Link)
    if (listingId) {
      keyboard.push([
        {
          text: "🔍 ዝርዝር ይመልከቱ",
          url: `${deepLinkBase}?startapp=listing-${listingId}`,
        },
      ]);
    }

    // Third row: Post a Listing button (Deep Link)
    keyboard.push([
      {
        text: "➕ የራስዎን ንብረት ይለጥፉ",
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
    return `📱 <b>የአድራሻ መረጃ</b>\n\n` +
           `ንብረት: ${propertyDescription}\n` +
           `ስልክ: <code>${phoneNumber}</code>\n\n` +
           `<i>ስልክ ቁጥሩን ለመቅዳት ይጫኑት።</i>`;
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
