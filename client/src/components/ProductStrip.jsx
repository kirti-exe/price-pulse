import ProductCard from "./ProductCard"

function ProductStrip({ title, subtitle, products }) {
    if(products.length === 0) return null

    return (
        <section className="strip">
            <h2>{title}</h2>
            {subtitle && <p className="strip-subtitle">{subtitle}</p>}

            <div className="strip-scroll">
                {products.map((product) => (
                    <div className="strip-item" key={product.id}>
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </section>
    )
}

export default ProductStrip