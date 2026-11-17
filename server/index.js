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
  try{
    const { name, listings } = req.body
    
    const valid = 
      typeof name === "string" && 
      name.trim() !== "" &&
      Array.isArray(listings) &&
      listings.length > 0 &&
      listings.every(
        (l) =>
          typeof l.store === "String" &&
        Number.isInteger(l.price) && l.price > 0 &&
        Number.isInteger(l.originalPrice) && l.originalPrice > 0
      )
      
    if (!valid) {
      return res.status(400).json({ error: "Invalid product data" })
    }

    const id = await addProduct({ name: name.trim(), listings })
    res.status(201).json({ id })
  }catch(err){
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