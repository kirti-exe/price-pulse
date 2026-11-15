import { Routes, Route, Link } from "react-router-dom"
import Home from "./pages/Home"
import ProductPage from "./pages/ProductPage"
import "./App.css"

function App(){
  return (
    <div className="container">
      <h1>
        <Link to="/" className="logo">Price Pulse</Link>
      </h1>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>
    </div>
  )
}

export default App