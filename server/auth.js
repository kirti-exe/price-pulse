import jwt from "jsonwebtoken"

export function signToken(userId) {
  return jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: "7d",
    algorithm: "HS256",
  })
}

export function requireUser(req, res, next) {
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not set")
    return res.status(500).json({ error: "Server is not configured" })
  }

  const header = req.headers.authorization || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : null
  if (!token) return res.status(401).json({ error: "Please log in" })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] })
    req.userId = Number(payload.sub)
    next()
  } catch {
    res.status(401).json({ error: "Session expired. Please log in again" })
  }
}