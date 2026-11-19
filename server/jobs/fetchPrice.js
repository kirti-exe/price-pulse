import { fetchFake } from "./fetchers/fake.js"
import { fetchFlipkart, flipkartConfigured } from "./fetchers/flipkart.js"

const USE_FAKE = process.env.FAKE_PRICES === "true"

export async function fetchPrice(listing) {
    if(listing.store === "Flipkart" && flipkartConfigured() && listing.external_id) {
        return fetchFlipkart(listing)
    }

    // Amazon, Myntra, etc.: add their fetchers here when you have access.

    if(USE_FAKE) return fetchFake(listing)

    return null // no real souce for this listing: leave the price alone
}