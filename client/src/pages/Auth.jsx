import { useState } from "react";
import { Navigate } from "react-router-dom";
import { API_URL } from "../utils";
import { useAuth } from "../AuthContext";

function Auth(){
    const { user, login } = useAuth()
    const [mode, setMode] = useState("login")
    const [email, setEmail] = useState("")
    const [password, SetPassword] = useState("")
    const [error, setError] = useState(null)
    const [busy, setBusy] = useState(false)
    
    if(user) return <Navigate to="/watchlist" replace />

    async function handleSubmit(e) {
        e.preventDefault()
        setBusy(true)
        setError(null)

        try{
            const res = await fetch(`${API_URL}/api/auth/${mode}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json().catch(() => null)
            if(!res.ok || !data) throw new Error(data?.error || "Something went wrong")

            login(data)
        }catch(err){
            setError(err.message)
        }finally{
            setBusy(false)
        }
    }

    const isSignup = mode === "signup"

    return (
        <form className="auth-form" onSubmit={handleSubmit}>
            <h2>{isSignup ? "Create an account": "Login in"}</h2>

            <input 
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required 
            />
            <input
                input="password"
                placeholder={isSignup ? "Password (8+ characters)" : "Password"}
                value={password}
                onChange={(e) => SetPassword(e.target.value)}
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
            />

            <button type="submit" disabled={busy}>
                {busy ? "Please wait..." : isSignup ? "Sign up" : "Log in"}
            </button>

            {error && <p className="alert-status error">{error}</p>}

            <p className="auth-hint">
                Demo site: please don't reuse a password from anywhere else. There is no
                password reset yet.
            </p>

            <button
                type="button"
                className="auth-switch"
                onClick={() => {
                    setMode(isSignup ? "login" : "signup")
                    setError(null)
                }}
            >
                {isSignup ? "Already have na account? Log in" : "New here? Create an account"}
            </button>
        </form>
    )
}

export default Auth