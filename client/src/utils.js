export const API_URL = "http://localhost:5000"

export function getBestListing(product) {
  return product.listings.reduce((best, current) =>
    current.price < best.price ? current : best
  )
}