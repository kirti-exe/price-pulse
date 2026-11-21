import { useState } from "react"

const icons = {
    Electronics: "🎧",
    Fashion: "👟",
    Home: "🏠",
    Fitness: "🏋️",
}

function ProductImage({product}){
    const [failed, setFailed] = useState(false)

    if(!product.image || failed){
        return(
            <div className="image-placeholder">
                {icons[product.category] || "🛍️"}
            </div>
        )
    }

    return (
        <img
          className="product-img"
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
    )
}

export default ProductImage