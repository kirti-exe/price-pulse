import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom";
import { API_URL, getBestListing, getPriceStats, getDealVerdict } from "../utils";
import PriceChart from "../components/PriceChart";


function ProductPage(){
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function loadProduct(){
            try{
                setLoading(true)
                const res = await fetch(`${API_URL}/api/products/${id}`)
                if(!res.ok) throw new Error("Product not found")
                const data = await res.json()
                setProduct(data)
                setError(null)
            } catch (err) {
                setProduct(null)
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        loadProduct()
    }, [id])

    if(loading) return <p>Loading product...</p>
    
    if(error || !product){
        return (
            <div>
                <p>{error || "Product not found."}</p>
                <Link to="/">← Back to all products</Link>
            </div>
        )
    }

    const best = getBestListing(product)
    const stores = product.listings.map((l) => l.store)

    const { lowest, highest, average } = getPriceStats(product)
    const verdict = getDealVerdict(best.price, { lowest, highest })
    const belowAverage = Math.round(((average - best.price) / average) * 100)

    return (
        <div>
            <Link to="/">← Back to all products</Link>
            <h2>{product.name}</h2>
            <p className="best-deal">
                Best price: ₹{best.price} on {best.store}
            </p>

            <p className={`verdict ${verdict.level}`}>
                {verdict.label}
                {belowAverage > 0 && ` · ${belowAverage}% below the average price`}
                {belowAverage < 0 && ` · ${Math.abs(belowAverage)}% above the average price`}
            </p>

            <div className="stats">
                <div className="stat">
                    <span>Lowest</span>
                    <strong>₹{lowest}</strong>
                </div>
                <div className="stat">
                    <span>Average</span>
                    <strong>₹{average}</strong>
                </div>
                <div className="stat">
                    <span>Highest</span>
                    <strong>₹{highest}</strong>
                </div>
            </div>

            <h3>Price history</h3>
            <PriceChart history={product.history} stores={stores} />

            <h3>Compare prices</h3>
            <table className="compare-table">
                <thead>
                    <tr>
                        <th>Store</th>
                        <th>Price</th>
                        <th>Original</th>
                        <th>Discount</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {product.listings.map(listing => {
                        const discount = Math.round(
                            ((listing.originalPrice - listing.price) / listing.originalPrice) * 100
                        )
                        return (
                            <tr 
                                key={listing.store} 
                                className={listing.store === best.store ? "best-row" : ""}
                            >
                                <td>{listing.store}</td>
                                <td>₹{listing.price}</td>
                                <td className="original-price">₹{listing.originalPrice}</td>
                                <td>{discount}%</td>
                                <td>
                                    <a href="#" className="buy-btn">Buy</a>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default ProductPage