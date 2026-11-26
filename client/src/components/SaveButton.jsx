import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../AuthContext"

function Savebutton({ productId }){
    const { user, isSaved, toggleSave } = useAuth()
    const [busy, setBusy] = useState(false)

    if(!user){
        return(
            <Link to="/login" className="save-btn">
                ☆ Log in to save
            </Link>
        )
    }

    const saved = isSaved(productId)

    async function handleClick() {
        setBusy(true)
        try{
            await toggleSave(productId)
        }catch(err){
            alert(err.message)
        }finally{
            setBusy(false)
        }
    }

    return (
        <button
            className={`save-btn ${saved ? "saved" : ""}`}
            onClick={handleClick}
            disabled={busy}
        >
            {saved ? "★ Saved" : "☆ Save to watchlist"}
        </button>
    )
}

export default Savebutton