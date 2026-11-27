import cron from "node-cron"
import { updateAllPrices } from "./jobs/updatePrices.js"
import express from "express"
import cors from "cors"
import {
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  recordPrice,
  addAlert,
  createUser,
  getUserByEmail,
  getWatchlistProductIds,
  addToWatchlist,
  removeFromWatchlist,
} from "./db/queries.js"
import rateLimit from "express-rate-limit"
import bcrypt from "bcryptjs"
import helmet from "helmet"
import { signToken, requireUser } from "./auth.js"

const app = express()
app.use(helmet())
const PORT = process.env.PORT || 5000

app.set("trust proxy", 1)

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
)
app.use(express.json({ limit: "10kb" }))

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  skipSuccessfulRequests: true,
})

function checkAdminKey(req, res, next){
  if(!process.env.ADMIN_KEY || req.headers["x-admin-key"] != process.env.ADMIN_KEY){
    return res.status(401).json({ error: "Unauthorized" })
  }
  next()
}

const requireAdmin = [adminLimiter, checkAdminKey]

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

function cleanProductFields(body){
  const { name, category, image } = body || {}

  if(typeof name !== "string" || name.trim() === "" || name.length > 200){
    return { error: "Name is required (max 200 characters)" }
  }
  if(category != null && (typeof category !== "string" || category.length > 50)){
    return { error: "Category must be short text" }
  }
  if(
    image != null &&
    (typeof image !== "string" ||
      image.length > 300 ||
      !(image.startsWith("/") || image.startsWith("https://")))
  ) {
    return { error: "Image must start with / or https://" }
  }

  return {
    value: {
      name: name.trim(),
      category: category?.trim() || null,
      image: image?.trim() || null,
    },
  }
}

app.get("/api/admin/check", requireAdmin, (req, res) => {
  res.json({ ok: true })
})

app.post("/api/products", requireAdmin, async (req, res) => {
  try {
    const fields = cleanProductFields(req.body)
    if(fields.error) return res.status(400).json({ error: fields.error })

    const listings = req.body.listings
    if(!Array.isArray(listings) || listings.length === 0){
      return res.status(400).json({ error: "Add at least one store listing" })
    }

    for(const l of listings){
      if(typeof l.store !== "string" || l.store.trim() === ""){
        return res.status(400).json({ error: "Each lisitings needs a store name" })
      }
      if(!Number.isInteger(l.price) || l.price <= 0){
        return res.status(400).json({ error: "Price must be a whole number above 0" })
      }
      if(!Number.isInteger(l.originalPrice) || l.originalPrice <= 0){
        return res.status(400).json({ error: "Original price must be a whole number above 0"})
      }
    }

    const cleaned = listings.map((l) => ({ ...l, store: l.store.trim() }))
    if(new Set(cleaned.map((l) => l.store)).size !== cleaned.length){
      return res.status(400).json({ error: "Each store can only be listed once" })
    }

    const id = await addProduct({ ...fields.value, listings: cleaned })
    res.status(201).json({ id })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
})

app.put("/api/products/:id", requireAdmin, async (req, res) => {
  try{
    const id = Number(req.params.id)
    if(!Number.isInteger(id)) return res.status(404).json({ error: "Product not found" })

    const fields = cleanProductFields(req.body)
    if(fields.error) return res.status(400).json({ error: fields.error })

    const found = await updateProduct(id, fields.value)
    if(!found) return res.status(404).json({ error: "Product not found" })

    res.json({ ok: true })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
})

app.delete("/api/products/:id", requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id)
    if(!Number.isInteger(id)) return res.status(404).json({ error: "Product not found" })

    const found = await deleteProduct(id)
    if(!found) return res.status(404).json({ error: "Product not found" })

    res.json({ ok: true })
  } catch(err){
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

app.post("/api/admin/update-prices", requireAdmin, async (req, res) => {
  try {
    const summary = await updateAllPrices()
    res.json(summary)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
})

const alertLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10 })

app.post("/api/alerts", async (req, res) => {
  try {
    const { productId, email, targetPrice } = req.body || {}

    const emailOk =
      typeof email === "string" &&
      email.length <= 254 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ error: "Invalid product" })
    }
    if (!emailOk) {
      return res.status(400).json({ error: "Please enter a valid email" })
    }
    if (!Number.isInteger(targetPrice) || targetPrice <= 0) {
      return res.status(400).json({ error: "Target price must be a whole number above 0" })
    }

    const id = await addAlert(productId, email.trim().toLowerCase(), targetPrice)
    if (id === null) {
      return res.status(404).json({ error: "Product not found" })
    }

    res.status(201).json({ id })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
})

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 })
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10)
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readCredentials(body) {
  const rawEmail = typeof body?.email === "string" ? body.email.trim() : ""
  const password = body?.password

  if (rawEmail.length > 254 || !EMAIL_RE.test(rawEmail)) {
    return { error: "Please enter a valid email" }
  }
  if (typeof password !== "string" || password.length === 0) {
    return { error: "Password is required" }
  }
  if (password.length > 200) {
    return { error: "Password is too long" }
  }
  return { email: rawEmail.toLowerCase(), password }
}

app.post("/api/auth/signup", authLimiter, async (req, res) => {
  try {
    const creds = readCredentials(req.body)
    if (creds.error) return res.status(400).json({ error: creds.error })

    if (creds.password.length < 8 || creds.password.length > 72) {
      return res.status(400).json({ error: "Password must be 8 to 72 characters" })
    }

    const hash = await bcrypt.hash(creds.password, 10)
    const id = await createUser(creds.email, hash)
    if (id === null) {
      return res.status(409).json({ error: "An account with this email already exists" })
    }

    res.status(201).json({ token: signToken(id), user: { id, email: creds.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
})

app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const creds = readCredentials(req.body)
    if (creds.error) return res.status(400).json({ error: creds.error })

    const user = await getUserByEmail(creds.email)
    const ok = await bcrypt.compare(creds.password, user ? user.password_hash : DUMMY_HASH)

    if (!user || !ok) {
      return res.status(401).json({ error: "Invalid email or password" })
    }

    res.json({ token: signToken(user.id), user: { id: user.id, email: user.email } })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
})

app.get("/api/watchlist", requireUser, async (req, res) => {
  try {
    const ids = await getWatchlistProductIds(req.userId)
    if (ids.length === 0) return res.json([])

    const all = await getProducts()
    const byId = new Map(all.map((p) => [p.id, p]))
    res.json(ids.map((id) => byId.get(id)).filter(Boolean))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
})

app.post("/api/watchlist/:productId", requireUser, async (req, res) => {
  try {
    const productId = Number(req.params.productId)
    if (!Number.isInteger(productId)) return res.status(404).json({ error: "Product not found" })

    const ok = await addToWatchlist(req.userId, productId)
    if (!ok) return res.status(404).json({ error: "Product not found" })

    res.status(201).json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
})

app.delete("/api/watchlist/:productId", requireUser, async (req, res) => {
  try {
    const productId = Number(req.params.productId)
    if (!Number.isInteger(productId)) return res.status(404).json({ error: "Product not found" })

    await removeFromWatchlist(req.userId, productId)
    res.json({ ok: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Something went wrong" })
  }
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})

cron.schedule(
  "0 */6 * * *",
  () => {
    updateAllPrices().catch((err) => console.error("Scheduled update failed:", err))
  },
  { timezone: "Asia/Kolkata" }
)