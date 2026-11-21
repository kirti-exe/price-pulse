import { getAllListings, recordPrice } from "../db/queries.js"
import { fetchPrice } from "./fetchPrice.js"
import { checkAlerts } from "./checkAlerts.js"

let running = false

export async function updateAllPrices(){
    if(running) {
        console.log("Price update already running, skipping")
        return { skipped: true }
    }

    running = true
    let checked = 0
    let changed = 0
    let failed = 0

    try {
        const listings = await getAllListings()

        for(const listing of listings){
            checked++
            try{
                const newPrice = await fetchPrice(listing)
                if(newPrice === null || newPrice === listing.price) continue
                
                await recordPrice(listing.product_id, listing.store, newPrice)
                changed++
            } catch (err) {
                failed++
                console.error(`Failed: product ${listing.product_id} on ${listing.store}`, err.message)
            }
        }
    }finally{
        running = false
    }

    try{
        await checkAlerts()
    } catch(err) {
        console.error("Alert check failed:", err.message)
    }

    console.log(`Price update done: ${checked} checked, ${changed} changed, ${failed} failed`)
    return { checked, changed, failed}
}