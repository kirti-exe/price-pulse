import { createContext, useContext, useState, useEffect } from "react"
import { authFetch } from "./utils"

const AuthContext = createContext(null)

function readStored(){
    try{
        const raw = localStorage.getItem("auth")
        return raw ? JSON.parse(raw) : null
    }catch{
        return null
    }
}

export function AuthProvider({ children }){
    const [auth, setAuth] = useState(readStored) // { token, user } or null
    const [watchlist, setWatchlist]= useState([])

    function login(data){
        try{
            localStorage.setItem("auth", JSON.stringify(data))
        }catch{
            // storage unavailable: login lasts until refresh
        }
        setAuth(data)
    }

    function logout(){
        try{
            localStorage.removeItem("auth")
        }catch{
            //ignore
        }
        setAuth(null)
        setWatchlist([])
    }

    useEffect(() => {
        if(!auth) return

        let cancelled = false
        authFetch("/api/watchlist", auth.token)
            .then((list) => {
                if(!cancelled) setWatchlist(list)
            })
            .catch((err) => {
                if(err.status == 401) logout()
            })

        return () => {
            cancelled = true
        }
    }, [auth])

    function isSaved(productId){
        return watchlist.some((p) => p.id === productId)
    }

    async function toggleSave(productId){
        const method = isSaved(productId) ? "DELETE" : "POST"
        await authFetch(`/api/watchlist/${productId}`, auth.token, { method })
        setWatchlist(await authFetch("/api/watchlist", auth.token))
    }

    async function deleteAccount(){
        await authFetch("/api/account", auth.token, { method: "DELETE" })
        logout()
    }

    const value = {
        user: auth?.user ?? null,
        watchlist,
        login,
        logout,
        isSaved,
        toggleSave,
        deleteAccount,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    return useContext(AuthContext)
}