import { Link, useParams } from "react-router-dom";
import { products, getBestListing } from "../data/products";
function ProductPage(){
    const { id } = useParams()
    const product = products.find(p => p.id === Number(id))

    if(!product){
        return(
            <div>
                <p>Product not found.</p>
                <Link to="/">← Back to all products</Link>
            </div>
        )
    }

    const best = getBestListing(product)

    return (
        <div>
            <Link to="/">← Back to all products</Link>
            <h2>{product.name}</h2>
            <p className="best-deal">
                Best price: ₹{best.price} on {best.store}
            </p>

            <h3>Compare prices</h3>
            <table className="compare-table">
                <thead>
                    <tr>
                        <th>Store</th>
                        <th>Price</th>
                        <th>Original</th>
                        <th>Discount</th>
                    </tr>
                </thead>
                <tbody>
                    {product.listings.map(listing => {
                        const discount = Math.round(
                            ((listing.originalPrice - listing.price) / listing.originalPrice) * 100
                        )
                        return (
                            <tr key={listing.store} className={listing.store === best.store ? "best-row" : ""}>
                                <td>{listing.store}</td>
                                <td>₹{listing.price}</td>
                                <td className="original-price">₹{listing.originalPrice}</td>
                                <td>{discount}%</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default ProductPage