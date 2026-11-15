import { useState } from "react"
import { products, getBestListing } from "../data/products"
import ProductCard from "../components/ProductCard"
import SearchBar from "../components/SearchBar"

function Home() {
    const [searchText, setSearchText] = useState("")
    const [sortBy, setSortBy] = useState("default")

    const text = searchText.toLowerCase()

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(text) ||
        product.listings.some(l => l.store.toLowerCase().includes(text))
    )

    const sortedProducts = [...filteredProducts].sort((a, b) => {
        const bestA = getBestListing(a)
        const bestB = getBestListing(b)
        if(sortBy === "price-low") return bestA.price - bestB.price
        if(sortBy === "price-high") return bestB.price - bestA.price
        if(sortBy === "discount"){
            const discountA = (bestA.originalPrice - bestA.price) / bestA.originalPrice
            const discountB = (bestB.originalPrice - bestB.price) / bestB.originalPrice
            return discountB - discountA
        }
        if(sortBy === "name") return a.name.localeCompare(b.name)
            return 0

    })

    return (
        <div>
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
                <option value="name">Name: A to Z</option>
            </select>

            <p className="result-count">
                Showing {filteredProducts.length} of {products.length} products
            </p>

            <div className="product-grid">
                {sortedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {filteredProducts.length === 0 && <p>No products found.</p>}
        </div>
    )
}

export default Home