//  Fake fetcher for development.
// Later, replace the body with a call to a real affiliate API.
// Contract: return the current price as a whole number, or null if unavailable.
export async function fetchPrice(listing) {
    const changePercent = (Math.random() - 0.05) * 0.1 // between -5% and +5%
    let newPrice = Math.round(listing.price * (1 + changePercent))

    const min = Math.round(listing.original_price * 0.5)
    const max = listing.original_price

    return Math.max(min, Math.min(max, newPrice))
}