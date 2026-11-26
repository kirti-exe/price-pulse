import { Routes, Route, Link } from "react-router-dom"
import Home from "./pages/Home"
import ProductPage from "./pages/ProductPage"
import Admin from "./pages/Admin"
import Auth from "./pages/Auth"
import Watchlist from "./pages/Watchlist"
import ThemeToggle from "./components/ThemeToggle"
import { useAuth } from "./AuthContext"
import "./App.css"

function App() {
  const { user, logout } = useAuth()
  return (
    <>
      <header className="site-header">
        <ThemeToggle />
        <Link to="/" className="logo">📉 Price Pulse</Link>
        <p className="tagline">Compare prices across stores and buy at the right time</p>
     
        <nav className="header-nav">
          <Link to="/">Home</Link>
          <Link to="/watchlist">Watchlist</Link>
          {user ? (
            <button className="nav-btn" onClick={logout}>
              Log out ({user.email})
            </button>
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/watchlist" element={<Watchlist />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>

        <p className="demo-note">
          Prices shown are simulated demo data, not live store prices.
        </p>
      </main>
    </>
  )
}

export default App