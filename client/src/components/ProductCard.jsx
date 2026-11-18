import { Link } from "react-router-dom"
import { getBestListing, getPriceStats, getDealVerdict, getLastChange } from "../utils"

function ProductCard({ product }){
  const best = getBestListing(product)
  const stats = getPriceStats(product)
  const verdict = getDealVerdict(best.price, stats)
  const change = getLastChange(product, best.store)
  const savings = best.originalPrice - best.price
  const discount = Math.round((savings / best.originalPrice) * 100)

  return (
    <Link to={`/product/${product.id}`} className="card-link">
    <div className="card">
        <span className={`store-badge ${best.store.toLowerCase()}`}>Cheapest on {best.store}</span>
      <h3>{product.name}</h3>
      <span className={`deal-badge ${verdict.level}`}>{verdict.label}</span>
      <p className="price">₹{best.price}</p>
      <p className={change.diff < 0 ? "price-drop" : "price-rise"}>
        {change.diff < 0 ? "▼" : "▲"} ₹{Math.abs(change.diff)} since last check
      </p>
      <p className="oiginal-price">₹{best.originalPrice}</p>
      <p className="discount">
        {discount}% off (save ₹{savings})
      </p>
      <p className="store-count">Available on {product.listings.length} stores</p>
    </div>
    </Link>
  )
}

export default ProductCard