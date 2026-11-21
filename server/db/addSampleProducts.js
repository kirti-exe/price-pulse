import { pool } from "./db.js"

const items = [
  // Electronics
  { name: "Noise Cancelling Headphones", category: "Electronics", base: 4999, stores: ["Amazon", "Flipkart", "Croma"] },
  { name: "Mechanical Keyboard", category: "Electronics", base: 3299, stores: ["Amazon", "Flipkart"] },
  { name: "Action Camera", category: "Electronics", base: 6499, stores: ["Amazon", "Flipkart", "Croma"] },
  { name: "Portable Power Bank", category: "Electronics", base: 1499, stores: ["Amazon", "Flipkart", "Croma"] },
  { name: "Fast Charger", category: "Electronics", base: 999, stores: ["Amazon", "Flipkart"] },
  { name: "Full HD Webcam", category: "Electronics", base: 1799, stores: ["Amazon", "Croma"] },
  { name: "Wireless Earbuds", category: "Electronics", base: 2299, stores: ["Amazon", "Flipkart", "Croma"] },
  // Fashion
  { name: "Denim Jacket", category: "Fashion", base: 2199, stores: ["Myntra", "Amazon", "Flipkart"] },
  { name: "Leather Wallet", category: "Fashion", base: 899, stores: ["Myntra", "Amazon", "Flipkart"] },
  { name: "Sports Sneakers", category: "Fashion", base: 2999, stores: ["Myntra", "Amazon", "Flipkart"] },
  { name: "Cotton Hoodie", category: "Fashion", base: 1499, stores: ["Myntra", "Flipkart"] },
  { name: "Analog Wrist Watch", category: "Fashion", base: 1999, stores: ["Myntra", "Amazon", "Flipkart"] },
  { name: "Polarized Sunglasses", category: "Fashion", base: 1299, stores: ["Myntra", "Amazon"] },
  // Home
  { name: "Steel Water Bottle", category: "Home", base: 699, stores: ["Amazon", "Flipkart"] },
  { name: "LED Desk Lamp", category: "Home", base: 1199, stores: ["Amazon", "Flipkart", "Croma"] },
  { name: "Air Fryer", category: "Home", base: 5499, stores: ["Amazon", "Flipkart", "Croma"] },
  { name: "Non Stick Cookware Set", category: "Home", base: 2799, stores: ["Amazon", "Flipkart"] },
  { name: "Cotton Bedsheet Set", category: "Home", base: 1299, stores: ["Amazon", "Flipkart", "Myntra"] },
  { name: "Electric Kettle", category: "Home", base: 999, stores: ["Amazon", "Flipkart", "Croma"] },
  // Fitness
  { name: "Yoga Mat", category: "Fitness", base: 799, stores: ["Amazon", "Flipkart"] },
  { name: "Adjustable Dumbbell Set", category: "Fitness", base: 5999, stores: ["Amazon", "Flipkart"] },
  { name: "Resistance Bands Set", category: "Fitness", base: 599, stores: ["Amazon", "Flipkart"] },
  { name: "Smart Fitness Band", category: "Fitness", base: 2499, stores: ["Amazon", "Flipkart", "Croma"] },
]

const POINTS = 30 // one price point every 3 days, about 90 days

function rand(min, max) {
  return Math.random() * (max - min) + min
}

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function makeSeries(originalPrice) {
  let price = originalPrice * rand(0.85, 0.95)
  const series = []

  for (let i = 0; i < POINTS; i++) {
    price = price * (1 + rand(-0.06, 0.05))
    price = Math.max(originalPrice * 0.6, Math.min(originalPrice, price))
    series.push({ price: Math.round(price), daysAgo: (POINTS - 1 - i) * 3 })
  }
  return series
}

async function getStoreId(client, name) {
  const result = await client.query(
    `INSERT INTO stores (name) VALUES ($1)
     ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    [name]
  )
  return result.rows[0].id
}

async function run() {
  let added = 0

  for (const item of items) {
    const existing = await pool.query("SELECT 1 FROM products WHERE name = $1", [item.name])
    if (existing.rowCount > 0) {
      console.log("Skipping (already exists):", item.name)
      continue
    }

    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const image = `/images/${slug(item.name)}.jpg`
      const productResult = await client.query(
        "INSERT INTO products (name, category, image) VALUES ($1, $2, $3) RETURNING id",
        [item.name, item.category, image]
      )
      const productId = productResult.rows[0].id

      for (const store of item.stores) {
        const storeId = await getStoreId(client, store)
        const originalPrice = Math.round(item.base * rand(1.0, 1.15))
        const series = makeSeries(originalPrice)
        const current = series[series.length - 1].price

        const listingResult = await client.query(
          `INSERT INTO listings (product_id, store_id, price, original_price)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [productId, storeId, current, originalPrice]
        )
        const listingId = listingResult.rows[0].id

        for (const point of series) {
          await client.query(
            `INSERT INTO price_history (listing_id, price, recorded_at)
             VALUES ($1, $2, NOW() - make_interval(days => $3::int))`,
            [listingId, point.price, point.daysAgo]
          )
        }
      }

      await client.query("COMMIT")
      added++
      console.log("Added:", item.name, "-> image:", image)
    } catch (err) {
      await client.query("ROLLBACK")
      console.error("Failed:", item.name, err.message)
    } finally {
      client.release()
    }
  }

  console.log(`Done. ${added} products added.`)
  await pool.end()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})