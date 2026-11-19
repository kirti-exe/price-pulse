const BASE = "https://affiliate-api.flipkart.net/affiliate/1.0/product.json"

export function flipkartConfigured(){
    return Boolean(process.env.FLIPKART_AFFILIATE_ID && process.env.FLIPKART_AFFILIATE_TOKEN)
}

export async function fetchFlipkart(listing) {
    if(!listing.external_id) return null
    
    const res = await fetch(`${BASE}?id=${encodeURIComponent(listing.external_id)}`, {
      headers: {
        "Fk-Affiliate-Id": process.env.FLIPKART_AFFILIATE_ID,
        "Fk-Affiliate-Token": process.env.FLIPKART_AFFILIATE_TOKEN,
      },
    })

    if(!res.ok) throw new Error(`Flipkart API returned ${res.status}`)

    const data = await res.json()
    const info = data?.productBaseInfoV1

    const price = info?.flipkartSpecialPrice?.amount ?? info?.flipkartSellingPrice?.amount
    return Number.isFinite(price) ? Math.round(price) : null
}