import { useState } from "react"
import { products } from "./data/products"
import ProductCard from "./components/ProductCard"
import SearchBar from "./components/SearchBar"
import "./App.css"

function App(){
  const [searchText, setSearchText] = useState("")

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.store.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div className="container">
      <h1>Price Pulse</h1>

      <SearchBar value={searchText} onChange={setSearchText} />

      <p className="result-count">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      <div classname="product-grid">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

        {filteredProducts.length === 0 && <p>No products found.</p>}
    </div>
  )
}

export default App