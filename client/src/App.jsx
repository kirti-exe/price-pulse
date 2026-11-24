import { Routes, Route, Link } from "react-router-dom"
import Home from "./pages/Home"
import ProductPage from "./pages/ProductPage"
import Admin from "./pages/Admin"
import ThemeToggle from "./components/ThemeToggle"
import "./App.css"

function App() {
  return (
    <>
      <header className="site-header">
        <ThemeToggle />
        <Link to="/" className="logo">📉 Price Pulse</Link>
        <p className="tagline">Compare prices across stores and buy at the right time</p>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
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