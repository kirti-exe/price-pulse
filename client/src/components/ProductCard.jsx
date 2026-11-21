import { Link } from "react-router-dom"
import { getBestListing, getPriceStats, getDealVerdict, getLastChange } from "../utils"
import ProductImage from "./ProductImage"

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
        <div className="card-image">
          <ProductImage product={product} />
          {discount > 0 && <span className="discount-tag">{discount}% off</span>}
        </div>

        <div className="card-body">
          <span className={`deal-badge ${verdict.level}`}>{verdict.label}</span>
          <h3>{product.name}</h3>

          <p className="price">
            ₹{best.price} <span className="original-price">₹{best.originalPrice}</span>
          </p>

          {change && (
            <p className={change.diff < 0 ? "price-drop" : "price-rise"}>
             {change.diff < 0 ? "▼" : "▲"} ₹{Math.abs(change.diff)} since last check
            </p>
          )}

          <span className={`store-badge ${best.store.toLowerCase()}`}>
            Cheapest on {best.store}
          </span>
          <p className="store-count">Available on {product.listings.length} stores</p>
        </div> 
      </div>
    </Link>
  )
}

export default ProductCard