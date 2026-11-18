import { useState } from "react"
import { API_URL } from "../utils"

function AlertForm({ productId, currentPrice }) {
  const [email, setEmail] = useState("")
  const [target, setTarget] = useState("")
  const [status, setStatus] = useState(null)
  const [sending, setSending] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setSending(true)
    setStatus(null)

    try {
      const res = await fetch(`${API_URL}/api/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          email,
          targetPrice: Number(target),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Could not save the alert")

      setStatus({ type: "success", message: "Alert saved! We'll email you when the price drops." })
      setEmail("")
      setTarget("")
    } catch (err) {
      setStatus({ type: "error", message: err.message })
    } finally {
      setSending(false)
    }
  }

  return (
    <form className="alert-form" onSubmit={handleSubmit}>
      <h3>Get a price drop alert</h3>
      <p className="alert-hint">Current best price: ₹{currentPrice}</p>

      <input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Target price (₹)"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        min="1"
        required
      />
      <button type="submit" disabled={sending}>
        {sending ? "Saving..." : "Notify me"}
      </button>

      {status && <p className={`alert-status ${status.type}`}>{status.message}</p>}
    </form>
  )
}

export default AlertForm