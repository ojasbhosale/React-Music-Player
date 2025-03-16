"use client"

import { useState, useEffect } from "react"
import Home from "./pages/Home"
import Header from "./components/Header"
import "./App.css"

const App = () => {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      setDarkMode(true)
      document.body.classList.add("dark-theme")
    }
  }, [])

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    if (!darkMode) {
      document.body.classList.add("dark-theme")
      localStorage.setItem("theme", "dark")
    } else {
      document.body.classList.remove("dark-theme")
      localStorage.setItem("theme", "light")
    }
  }

  return (
    <div className={`app ${darkMode ? "dark-theme" : ""}`}>
      <Header darkMode={darkMode} toggleTheme={toggleTheme} />
      <Home />
    </div>
  )
}

export default App

