import { pool } from "./db.js"

export async function getProducts(productId = null) {
  const productsResult = await pool.query(
    `SELECT id, name
     FROM products
     WHERE ($1::int IS NULL OR id = $1)
     ORDER BY id`,
    [productId]
  )

  const listingsResult = await pool.query(
    `SELECT l.product_id, s.name AS store, l.price, l.original_price
     FROM listings l
     JOIN stores s ON s.id = l.store_id
     WHERE ($1::int IS NULL OR l.product_id = $1)
     ORDER BY l.id`,
    [productId]
  )

  const historyResult = await pool.query(
    `SELECT l.product_id, s.name AS store, ph.price,
            to_char(ph.recorded_at AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD HH24:MI') AS ym,
            to_char(ph.recorded_at AT TIME ZONE 'Asia/Kolkata', 'FMDD Mon HH24:MI') AS month
     FROM price_history ph
     JOIN listings l ON l.id = ph.listing_id
     JOIN stores s ON s.id = l.store_id
     WHERE ($1::int IS NULL OR l.product_id = $1)
     ORDER BY ph.recorded_at, ph.id`,
    [productId]
  )

  return productsResult.rows.map((product) => {
    const listings = listingsResult.rows
      .filter((l) => l.product_id === product.id)
      .map((l) => ({
        store: l.store,
        price: l.price,
        originalPrice: l.original_price,
      }))

    const historyByMonth = {}
    const history = []

    for (const row of historyResult.rows) {
      if (row.product_id !== product.id) continue

      if (!historyByMonth[row.ym]) {
        historyByMonth[row.ym] = { month: row.month }
        history.push(historyByMonth[row.ym])
      }
      historyByMonth[row.ym][row.store] = row.price
    }

    return { id: product.id, name: product.name, listings, history }
  })
}

async function getOrCreateStoreId(client, name) {
    const result = await client.query(
        `INSERT INTO stores (name) VALUES ($1)
        ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
        RETURNING id`,
        [name]
    )
    return result.rows[0].id
}

export async function addProduct({ name, listings }){
    const client = await pool.connect()

    try{
        await client.query("BEGIN")

        const productResult = await client.query(
            "INSERT INTO products (name) VALUES ($1) RETURNING id",
            [name]
        )
        const productId = productResult.rows[0].id

        for(const l of listings){
            const storeId = await getOrCreateStoreId(client, l.store)

            const listingResult = await client.query(
                `INSERT INTO listings (product_id, store_id, price, original_price)
                VALUES ($1, $2, $3, $4) RETURNING id`,
                [productId, storeId, l.price, l.originalPrice]
            )

            await client.query(
                `INSERT INTO price_history (listing_id, price, recorded_at)
                VALUES ($1, $2, NOW())`,
                [listingResult.rows[0].id, l.price]
            )
        }

        await client.query("COMMIT")
        return productId
    }catch(err){
        await client.query("ROLLBACK")
        throw err
    }finally{
        client.release()
    }
}

export async function recordPrice(productId, store, price){
    const updated = await pool.query(
        `UPDATE listings l
        SET price = $3
        FROM stores s
        WHERE s.id = l.store_id AND l.product_id = $1 AND s.name = $2
        RETURNING l.id`,
        [productId, store, price]
    )

    if(updated.rowCount === 0) return false

    await pool.query(
    `INSERT INTO price_history (listing_id, price, recorded_at)
     VALUES ($1, $2, NOW())`,
    [updated.rows[0].id, price]
)
    return true
}

export async function getAllListings() {
  const result = await pool.query(
    `SELECT l.product_id, s.name AS store, l.price, l.original_price
     FROM listings l
     JOIN stores s ON s.id = l.store_id
     ORDER BY l.id`
  )
  return result.rows
}

export async function addAlert(productId, email, targetPrice) {
  const product = await pool.query("SELECT 1 FROM products WHERE id = $1", [productId])
  if (product.rowcount === 0) return null
  
  const result = await pool.query(
    `INSERT INTO alerts (product_id, email, target_price)
    VALUES ($1, $2, $3) RETURNING id`,
    [productId, email, targetPrice]
  )
  return result.rows[0].id
}

export async function getTriggeredAlerts() {
  const result = await pool.query(
    `SELECT a.id, a.email, a.target_price,
            p.id AS product_id, p.name AS product_name,
            best.price, best.store
    FROM alerts a
    JOIN products p ON p.id = a.product_id
    JOIN LATERAL (
      SELECT l.price, s.name AS store
      FROM lsitings l 
      JOIN stores s ON s.id = l.store_id
      WHERE l.product_id = a.product_id
      ORDER BY l.price
      LIMIT 1
    ) best ON TRUE
    WHERE a.notified_at IS NULL AND best.price <= a.target_price`
  )
  return result.rows
}

export async function markAlertNotified(alertId){
  await pool.query("UPDATE alerts SET notfied_at = NOW() WHERE id = $1", [alertId])
}