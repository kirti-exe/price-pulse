import {useState, useEffect} from "react"

function getInitialTheme(){
    try{
        const saved = localStorage.getItem("theme")
        if(saved === "light" || saved === "dark") return saved
    } catch {
        // storage unavailable: fall through
    }
    return window.matchMedia("(prefers-color-scheme: darl)").matches ? "dark" : "light" 
}

function ThemeToggle(){
    const [theme, setTheme] = useState(getInitialTheme)

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        try{
            localStorage.setItem("theme", theme)
        }catch{
            // ignore
        }
    }, [theme])

    return (
        <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle dark mode"
        >
            {theme === "dark" ? "☀️" : "🌙"}
        </button>
    )
}

export default ThemeToggle