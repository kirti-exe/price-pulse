import { pool } from "./db.js"

export async function getProducts(productId = null) {
    const productsResult = await pool.query(
        `SELECT id, name
        FROM products
        WHERE ($1::int IS NULL OR id = $1)
        ORDER BY id`,
        [productId]
    )

    const listingResult = await pool.query(
        `SELECT l.product_id, s.name AS store, l.price, l.original_price
        FROM listings l
        JOIN stores s ON s.id = l.store_id
        WHERE ($1::int IS NULL OR l.product_id = $1)
        ORDER BY l.id`,
        [productId]
    )

    const historyResult = await pool.query(
        `SELECT l.product_id, s.name AS store, ph.price,
                to_char(ph.recorded_at, 'YYYY-MM') AS ym,
                to_char(ph.recorded_at, 'Mon') AS month
        FROM price_history ph
        JOIN lisitngs l ON l.id = ph.listing_id
        JOIN stores s ON s.id = l.store_id
        WHERE ($1::int IS NULL OR l.product_id = $1)
        ORDER BY ph.recorded_at, ph.id`
        [productId]
    )

    return productsResult.rows.map((product) => {
        const listings = listingsResult.rows
            .filter((l) => l.products_id === product.id)
            .map((l) => ({
                store: l.store,
                price: l.price,
                originalPrice: l.originalPrice,
            }))
        
            const historyByMonth = {}
            const history = []

            for(const row of historResult.rows){
                if(row.product_id !== product.id) continue

                if(!historyByMonth[row.ym]){
                    historyByMonth[row.ym] = { month: row.month }
                    history.push(historyByMonth[row.ym])
                }
                historyByMonth[row.ym][row.store] = row.price
            }
        return { id: product.id, name: product.name, listings, history }
    })
}