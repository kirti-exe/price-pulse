import fs from "fs"
import { pool } from "./db.js"
import { products } from "../data/products.js"

const monthDates = {
  Jul: "2026-07-01",
  Aug: "2026-08-01",
  Sep: "2026-09-01",
  Oct: "2026-10-01",
  Nov: "2026-11-01",
}

async function seed() {
  const schema = fs.readFileSync(new URL("./schema.sql", import.meta.url), "utf8")
  await pool.query(schema)

  const storeIds = {}

  for (const product of products) {
    const productResult = await pool.query(
      "INSERT INTO products (name) VALUES ($1) RETURNING id",
      [product.name]
    )
    const productId = productResult.rows[0].id

    for (const listing of product.listings) {
      if (!storeIds[listing.store]) {
        const storeResult = await pool.query(
          "INSERT INTO stores (name) VALUES ($1) RETURNING id",
          [listing.store]
        )
        storeIds[listing.store] = storeResult.rows[0].id
      }

      const listingResult = await pool.query(
        `INSERT INTO listings (product_id, store_id, price, original_price)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [productId, storeIds[listing.store], listing.price, listing.originalPrice]
      )
      const listingId = listingResult.rows[0].id

      for (const entry of product.history) {
        const price = entry[listing.store]
        if (price === undefined) continue

        await pool.query(
          `INSERT INTO price_history (listing_id, price, recorded_at)
           VALUES ($1, $2, $3)`,
          [listingId, price, monthDates[entry.month]]
        )
      }
    }
  }

  const counts = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM products) AS products,
      (SELECT COUNT(*) FROM stores) AS stores,
      (SELECT COUNT(*) FROM listings) AS listings,
      (SELECT COUNT(*) FROM price_history) AS history
  `)
  console.log("Seeded:", counts.rows[0])

  await pool.end()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})