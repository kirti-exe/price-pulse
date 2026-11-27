import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../AuthContext"
import ProductCard from "../components/ProductCard"

function Watchlist() {
  const { deleteAccount } = useAuth()
  const { user, watchlist } = useAuth()

  if (!user) return <Navigate to="/login" replace />

  return (
    <div>
      <h2 className="section-title">My watchlist</h2>

      {watchlist.length === 0 ? (
        <p className="status-message">
          Nothing saved yet. Open a product and click "Save to watchlist".{" "}
          <Link to="/" className="back-link">Browse products</Link>
        </p>
      ) : (
        <div className="product-grid">
          {watchlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <button
        className="link-btn"
        onClick={() => {
          if(window.confirm("Delete your account and watchlist? This can't be undone.")){
            deleteAccount().catch((err) => alert(err.message))
          }
        }}
      >
        Delete my account
      </button>
    </div>
  )
}

export default Watchlist