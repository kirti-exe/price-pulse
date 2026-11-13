const products = [
  { id: 1, name: "Wireless Mouse", price: 799, store: "Amazon", originalPrice: 1299 },
  { id: 2, name: "Runnibg Shoes", price: 2499, store: "Myntra", originalPrice: 3999 },
  { id: 3, name: "Bluetooth Speaker", price: 1999, store: "Flipkart", originalPrice: 2499 },
  { id: 4, name: "Wireless Gamepad", price: 2399, store: "Amazon", originalPrice: 2499 },
  { id: 5, name: "Casual T-Shirt", price: 599, store: "Myntra", originalPrice: 1199 },
  { id: 6, name: "Smartwatch", price: 3499, store: "Flipkart", originalPrice: 5999 },
]

function ProductCard(props){
  const savings = props.originalPrice - props.price
  const discount = Math.round((savings / props.originalPrice) * 100)

  return (
    <div className="card">
      <h3>{props.name}</h3>
      <p>Price: ₹{props.price}</p>
      <p>Original Price: ₹{props.originalprice}</p>
      <p style={{color: "green"}}>
        You save: ₹{savings} ({discount}% off)
      </p>
      <p>Store: {props.store}</p>
    </div>
  )
}

function App(){
  return (
    <div>
      <h1>Price Pulse</h1>
      {products.map(product => (
        <ProductCard
          key={product.id}
          name={product.name}
          price={product.price}
          store={product.store}
          originalPrice={product.originalPrice}
        />
      ))}
    </div>
  )
}

export default App