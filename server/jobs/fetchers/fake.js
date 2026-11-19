export async function fetchFake(listing) {
    const changePercent = (Math.random() - 0.05) * 0.1 // between -5% and +5%
    let newPrice = Math.round(listing.price * (1 + changePercent))

    const min = Math.round(listing.original_price * 0.5)
    const max = listing.original_price

    return Math.max(min, Math.min(max, newPrice))
}