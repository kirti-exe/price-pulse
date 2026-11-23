import { useState } from "react"
import { adminFetch } from "../utils"

const CATEGORIES = ["Electronics", "Fashion", "Home", "Fitness"]
const STORES = ["Amazon", "Flipkart", "Myntra", "Croma"]

function slug(name){
    return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

const emptyRow = () => ({ store: "Amazon", price: "", originalPrice: ""})

function AdminProductForm({ adminKey, onCreated }){
    const [name, setName] = useState("")
    const [category, setCategory] = useState(CATEGORIES[0])
    const [image, setImage] = useState("")
    const [rows, setRows] = useState([emptyRow()])
    const [status, setStatus] = useState(null)
    const [saving, setSaving] = useState(false)

    function updateRow(index, field, value){
        setRows(rows.map((row, i) => (i === index ? { ...row, [field]: value } : row)))
    }

    function removeRow(index){
        setRows(rows.filter((_, i) => i !== index))
    }

    async function handleSubmit(e){
        e.preventDefault()
        setSaving(true)
        setStatus(null)

        try{
            const body = {
                name,
                category,
                image: image.trim() || `/images/${slug(name)}.jpg`,
                listings: rows.map((row) => ({
                    store: row.store,
                    price: Number(row.price),
                    originalPrice: Number(row.originalPrice),
                })),
            }

            await adminFetch("/api/products", adminKey, {
                method: "POST",
                body: JSON.stringify(body),
            })

            setStatus({ type: "success", message: `Added "${name}` })
            setName("")
            setImage("")
            setRows([emptyRow()])
            onCreated()
        }catch(err){
            setStatus({ type: "error", message: err.message })
        }finally{
            setSaving(false)
        }
    }

    return (
        <form className="admin-form" onSubmit={handleSubmit}>
            <h3>Add a product</h3>

            <input  
                placeholder="Product name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />

            <div className="admin-row">
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                    ))}
                </select>
                <input
                    placeholder="Image path (blank = auto from name)"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                />
            </div>
            
            <h4>Store prices</h4>
            {rows.map((row, i) => (
                <div className="admin-row" key={i}>
                    <select value={row.store} onChange={(e) => updateRow(i, "store", e.target.value)}>
                        {STORES.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                    <input 
                        type="number"
                        min="1"
                        placeholder="Price ₹"
                        value={row.price}
                        onChange={(e) => updateRow(i, "price", e.target.value)}
                        required
                    />
                    <input
                        type="number"
                        min="1"
                        placeholder="Original ₹"
                        value={row.originalPrice}
                        onChange={(e) => updateRow(i, "originalPrice", e.target.value)}
                        required
                    />
                    {rows.length > 1 && (
                        <button type="button" className="link-btn" onClick={() => removeRow(i)}>
                            Remove
                        </button>
                    )}
                </div>
            ))}

            <button type="button" className="secondary-btn" onClick={() => setRows([...rows, emptyRow()])}>
                + Add another store
            </button>

            <button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save product"}
            </button>

            {status && <p className={`alert-status %{status.type}`}>{status.message}</p>}
        </form>
    )
}

export default AdminProductForm