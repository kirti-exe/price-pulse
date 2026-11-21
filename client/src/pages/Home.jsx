import { useState, useEffect } from "react"
import { API_URL, getBestListing } from "../utils"
import ProductCard from "../components/ProductCard"
import SearchBar from "../components/SearchBar"

function Home() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchText, setSearchText] = useState("")
    const [sortBy, setSortBy] = useState("default")
    const [category, setCategory] = useState("All")
    
    useEffect(() => {
        async function loadProducts(){
            try {
              const res = await fetch(`${API_URL}/api/products`)
              if(!res.ok) throw new Error("Server error")
              const data = await res.json()
              setProducts(data)
            } catch (err) {
              setError("Could not load products. Is the server running?")
            } finally {
              setLoading(false)
            }
        }

        loadProducts()
    }, [])

    if (loading) return <p className="status-message">Loading products... The server may take up to a minute to wake up</p>
    if (error) return <p className="status-message">{error}</p>

    const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))]
    const text = searchText.toLowerCase()

    const filteredProducts = products.filter((product) => {
        const matchesText = 
            product.name.toLowerCase().includes(text) ||
            product.listings.some(l => l.store.toLowerCase().includes(text))
        const matchesCategory = category === "All" || product.category === category
        return matchesText && matchesCategory
    })

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

            <div className="chips">
                {categories.map((c) => (
                    <button 
                        key={c}
                        className={`chips ${c === category ? "active" : ""}`}
                        onClick={() => setCategory(c)}
                    >
                        {c}
                    </button>
                ))}
            </div>

            <div className="toolbar">
                <p className="result-count">
                    Showing {filteredProducts.length} of {products.length} products
                </p>
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
            </div>

            <div className="product-grid">
                {sortedProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <p className="status-message">No products found.</p>
            )}
        </div>
    )
}

export default Home