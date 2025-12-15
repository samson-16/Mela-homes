// Debug script to check what's happening with a specific listing
const LISTING_ID = process.argv[2];

if (!LISTING_ID) {
  console.log("Usage: node debug-listing.js <listing_id>");
  process.exit(1);
}

async function debugListing() {
  console.log(`\n🔍 Debugging Listing ID: ${LISTING_ID}\n`);
  
  // 1. Fetch the listing from the backend
  try {
    console.log("1. Fetching listing from backend...");
    const backendUrl = `https://mela-homes-backend.onrender.com/api/rent-listings/${LISTING_ID}/`;
    const listingResponse = await fetch(backendUrl);
    const listing = await listingResponse.json();
    
    console.log("   ✅ Listing data:", JSON.stringify(listing, null, 2));
    console.log("\n   📸 Photos in response:", listing.data?.photos || listing.photos || "NO PHOTOS FOUND");
  } catch (error) {
    console.log("   ❌ Error:", error.message);
  }
  
  // 2. Try to post it to Telegram
  try {
    console.log("\n2. Testing Telegram posting...");
    const telegramUrl = "https://mela-homes.vercel.app/api/telegram/post-listing";
    
    // Get listing data
    const backendUrl = `https://mela-homes-backend.onrender.com/api/rent-listings/${LISTING_ID}/`;
    const listingResponse = await fetch(backendUrl);
    const listing = await listingResponse.json();
    const listingData = listing.data || listing;
    
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...listingData,
        id: LISTING_ID
      })
    });
    
    const result = await response.json();
    console.log("   Status:", response.status);
    console.log("   Response:", JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log("\n   ✅ SUCCESS! Check your Telegram channel.");
    } else {
      console.log("\n   ❌ FAILED. Error:", result.error);
    }
  } catch (error) {
    console.log("   ❌ Error:", error.message);
  }
}

debugListing();
