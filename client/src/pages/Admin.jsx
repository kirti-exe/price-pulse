import { useState, useEffect } from "react"
import { API_URL, adminFetch } from "../utils"
import AdminProductForm from "../components/AdminProductForm"

function Admin() {
  const savedKey = sessionStorage.getItem("adminKey") || ""

  const [keyInput, setKeyInput] = useState("")
  const [adminKey, setAdminKey] = useState(savedKey)
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(Boolean(savedKey))
  const [loginError, setLoginError] = useState(null)
  const [products, setProducts] = useState([])
  const [message, setMessage] = useState(null)

  async function loadProducts() {
    const res = await fetch(`${API_URL}/api/products`)
    if (!res.ok) throw new Error("Could not load products")
    const data = await res.json()
    setProducts(Array.isArray(data) ? data : [])
  }

  async function verify(key) {
    try {
      await adminFetch("/api/admin/check", key)
      sessionStorage.setItem("adminKey", key)
      setAdminKey(key)
      setAuthed(true)
      setLoginError(null)
      await loadProducts()
    } catch (err) {
      sessionStorage.removeItem("adminKey")
      setAuthed(false)
      setLoginError(err.message)
    } finally {
      setChecking(false)
    }
  }

  useEffect(() => {
    if (savedKey) verify(savedKey)
  }, [])

  function handleLogin(e) {
    e.preventDefault()
    setChecking(true)
    verify(keyInput)
  }

  function handleLogout() {
    sessionStorage.removeItem("adminKey")
    setAdminKey("")
    setKeyInput("")
    setAuthed(false)
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}" and all its price history?`)) return

    try {
      await adminFetch(`/api/products/${product.id}`, adminKey, { method: "DELETE" })
      setMessage({ type: "success", text: `Deleted "${product.name}"` })
      await loadProducts()
    } catch (err) {
      setMessage({ type: "error", text: err.message })
    }
  }

  if (checking) return <p className="status-message">Checking...</p>

  if (!authed) {
    return (
      <form className="admin-login" onSubmit={handleLogin}>
        <h2>Admin login</h2>
        <input
          type="password"
          placeholder="Admin key"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          required
        />
        <button type="submit">Log in</button>
        {loginError && <p className="alert-status error">{loginError}</p>}
      </form>
    )
  }

  return (
    <div>
      <div className="admin-top">
        <h2>Admin</h2>
        <button className="secondary-btn" onClick={handleLogout}>Log out</button>
      </div>

      <AdminProductForm adminKey={adminKey} onCreated={loadProducts} />

      {message && <p className={`alert-status ${message.type}`}>{message.text}</p>}

      <h3>Products ({products.length})</h3>
      <table className="compare-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Category</th>
            <th>Stores</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>{p.listings.map((l) => l.store).join(", ")}</td>
              <td>
                <button className="danger-btn" onClick={() => handleDelete(p)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Admin