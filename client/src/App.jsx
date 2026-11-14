import { useState } from "react"
import { products } from "./data/products"
import ProductCard from "./components/ProductCard"
import SearchBar from "./components/SearchBar"
import "./App.css"

function App(){
  const [searchText, setSearchText] = useState("")
  const [sortBy, setSortBy] = useState("default")

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchText.toLowerCase()) ||
    product.store.toLowerCase().includes(searchText.toLowerCase())
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if(sortBy === "price-low") return a.price - b.price
    if(sortBy === "price-high") return b.price - a.price
    if(sortBy === "discount") {
      const discountA = (a.originalPrice - a.price) / a.originalPrice
      const discountB = (b.originalPrice - b.price) / b.originalPrice
      return discountB - discountA
    }
    if(sortBy === "ascending") return a.name.localeCompare(b.name)
    return 0
  })

  return (
    <div className="container">
      <h1>Price Pulse</h1>

      <SearchBar value={searchText} onChange={setSearchText} />

      <select 
        className="sort-select"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="default">Sort by: Default</option>
        <option value="price-low">Price: Low to High</option>
        <option value="price-high">Price: High to Low</option>
        <option value="discount">Biggest Discount</option>
        <option value="ascending">Name: A to Z</option>
      </select>

      <p className="result-count">
        Showing {filteredProducts.length} of {products.length} products
      </p>

      <div classname="product-grid">
        {sortedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

        {filteredProducts.length === 0 && <p>No products found.</p>}
    </div>
  )
}

export default App