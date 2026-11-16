import express from "express"
import cors from "cors"
import { products } from "./data/products.js"

const app = express()
const PORT = 5000

app.use(cors())

app.get("/", (req, res) => {
  res.send("Price Tracker API is running")
})

app.get("/api/products", (req, res) => {
  res.json(products)
})

app.get("/api/products/:id", (req, res) => {
  const product = products.find((p) => p.id === Number(req.params.id))

  if (!product) {
    return res.status(404).json({ error: "Product not found" })
  }

  res.json(product)
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})