export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export function getBestListing(product) {
  return product.listings.reduce((best, current) =>
    current.price < best.price ? current : best
  )
}

export function getPriceStats(product){
  const stores = product.listings.map((l) => l.store)

  const prices = product.history
    .flatMap((entry) => stores.map((store) => entry[store]))
    .filter((price) => price !== undefined)

  const source = prices.length > 0 ? prices : product.listings.map((l) => l.price)

  const lowest = Math.min(...source)
  const highest = Math.max(...source)
  const average = Math.round(source.reduce((sum, p) => sum + p, 0) / source.length)

  return { lowest, highest, average }
}

export function getDealVerdict(price, { lowest, highest }){
  if(price <= lowest) return { label: "Great deal", level: "great" }
  if(highest === lowest) return { label: "Fair price", level: "fair" }

  const position = (price-lowest) / (highest-lowest)

  if(position <= 0.25) return { label: "Great deal", level: "great" }
  if(position <= 0.5) return { label: "Good price", level: "good" }
  if(position <= 0.75) return { label: "Fair price", level: "fair" }
  return { label: "Wait for a drop", level: "wait" }
}

export function getLastChange(product, store){
  const series = product.history
    .map((entry) => entry[store])
    .filter((price) => price !== undefined)

  if(series.length  < 2) return null

  const diff = series[series.length - 1] - series[series.length - 2]
  return diff === 0 ? null : { diff }
}

export async function adminFetch(path, adminKey, options = {}) {
  const res = await fetch(`${API_URL}$(path)`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": adminKey,
    },
  })

  const data = await res.json().catch(() => null)
  if(!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
  return data
}