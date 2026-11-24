import { useState, useEffect } from "react"
import { API_URL, getBestListing, getPriceStats } from "../utils"
import ProductCard from "../components/ProductCard"
import ProductStrip from "../components/ProductStrip"
import SearchBar from "../components/SearchBar"

const PAGE_SIZE = 12

function Home() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchText, setSearchText] = useState("")
    const [sortBy, setSortBy] = useState("default")
    const [category, setCategory] = useState("All")
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
    
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

    useEffect(() => {
        setVisibleCount(PAGE_SIZE)
    }, [searchText, category, sortBy])

    if(loading){
        return (
            <p className="status-message">
                Loading products... The server may take up to a minute to wake up.
            </p>
        )
    }
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

    // Highlight section (only shown when not searching or filtering)
    const isBrowsing = searchText === "" && category === "All"

    const analysed = products.map((product) => {
        const best = getBestListing(product)
        const stats = getPriceStats(product)
        const dropFromPeak = stats.highest > 0 ? (stats.highest - best.price) / stats.highest : 0
        return { product, atLowest: best.price <= stats.lowest, dropFromPeak}
    })

    const lowestEver = analysed.filter((X) => X.atLowest).map((x) => x.product)

    const biggestDrops = analysed
        .filter((x) => x.dropFromPeak > 0)
        .sort((a, b) => b.dropFromPeak - a.dropFromPeak)
        .slice(0, 8)
        .map((x) => x.product)

    const visibleProducts = sortedProducts.slice(0, visibleCount)
    const remaining = sortedProducts.length - visibleProducts.length

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

            {isBrowsing && (
                <>
                    <ProductStrip
                        title="🔥 Biggest price drops"
                        subtitle="Furthest below each product's highest recorded price"
                        products={biggestDrops}
                    />
                    <ProductStrip
                        title="🏆 Lowest price ever"
                        subtitle="Currently at their cheapest recorded price"
                        products={lowestEver}
                    />
                </>
            )}

            <div className="toolbar">
                <h2 className="section-title">
                    {isBrowsing ? "All products" : "Results"}
                </h2>
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

            <p className="result-count">
                Showing {visibleProducts.length} of {filteredProducts.length} products
            </p>   

            <div className="product-grid">
                {visibleProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {remaining > 0 && (
                <button
                    className="show-more"
                    onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}
                >
                    Show more ({remaining} left)
                </button>
            )}

            {filteredProducts.length === 0 && (
                <p className="status-message">No products found.</p>
            )}
        </div>
    )
}

export default Home