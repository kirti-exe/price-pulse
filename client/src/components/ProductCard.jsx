function ProductCard({ product }){
  const { name, price, originalPrice, store} = product
  const savings = originalPrice - price
  const discount = Math.round((savings / originalPrice) * 100)

  return (
    <div className="card">
        <span className={`store-badge ${store.toLowerCase()}`}>{store}</span>
      <h3>{name}</h3>
      <p className="price">₹{price}</p>
      <p className="oiginal-price">₹{originalPrice}</p>
      <p className="discount">
        {discount}% off (save ₹{savings})
      </p>
    </div>
  )
}

export default ProductCard