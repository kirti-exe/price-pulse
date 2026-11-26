import { Link, Navigate } from "react-router-dom"
import { useAuth } from "../AuthContext"
import ProductCard from "../components/ProductCard"

function Watchlist() {
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
    </div>
  )
}

export default Watchlist