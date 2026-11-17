import express from "express"
import cors from "cors"
import { getProducts, addProduct, recordPrice } from "./db/queries.js"

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

function requireAdmin(req, res, next){
  if(!process.env.ADMIN_KEY || req.headers["x-admin-key"] !== process.env.ADMIN_KEY){
    return res.status(401).json({ error: "Unauthorized" })
  }
  next()
}

app.get("/", (req, res) => {
  res.send("Price Tracker API is running")
})

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" })
})

app.get("/api/products", async (req, res) => {
  try {
    const products = await getProducts()
    res.json(products)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
})

app.get("/api/products/:id", async (req, res) => {
  try {
    const id = Number(req.params.id)
    if (!Number.isInteger(id)) {
      return res.status(404).json({ error: "Product not found" })
    }

    const products = await getProducts(id)
    if (products.length === 0) {
      return res.status(404).json({ error: "Product not found" })
    }

    res.json(products[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
})

app.post("/api/products", requireAdmin, async (req, res) => {
  try {
    console.log("body received:", req.body)

    if (!req.body || typeof req.body.name !== "string" || req.body.name.trim() === "") {
  return res.status(400).json({ error: "name is missing or not text" })
    }
    if (!Array.isArray(req.body.listings) || req.body.listings.length === 0) {
  return res.status(400).json({ error: "listings must be a non-empty array" })
}
for (const l of req.body.listings) {
  if (typeof l.store !== "string") {
    return res.status(400).json({ error: "each listing needs a store name (text)" })
  }
  if (!Number.isInteger(l.price) || l.price <= 0) {
    return res.status(400).json({ error: "price must be a whole number above 0" })
  }
  if (!Number.isInteger(l.originalPrice) || l.originalPrice <= 0) {
    return res.status(400).json({ error: "originalPrice must be a whole number above 0" })
  }
} 
const { name, listings } = req.body
const id = await addProduct({ name: name.trim(), listings })
res.status(201).json({ id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
})

app.post("/api/products/:id/price", requireAdmin, async(req, res) => {
  try{
    const id = Number(req.params.id)
    const { store, price } = req.body
    
    if(!Number.isInteger(id) || typeof store !== "string" || !Number.isInteger(price) || price <= 0) {
      return res.status(400).json({ error: "Invalid data" })
    }

    const found = await recordPrice(id, store, price)
    if(!found){
      return res.status(404).json({ error: "Listing not found" })
    }

    res.json({ ok: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})