import express from "express"
import cors from "cors"
import { getProducts } from "./data/queries.js"

const app = express()
const PORT = 5000

app.use(cors())

app.get("/", (req, res) => {
  res.send("Price Pulse API is running")
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
    if(!Number.isInteger(id)){
      return res.status(404).json({ error: "Product not found" })
    }
    
    const products = await getProducts(id)
    if(products.length === 0){
      return res.status(404).json({ error: "Product not found" })
    }

    res.json(products[0])
  } catch(err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong "})
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})