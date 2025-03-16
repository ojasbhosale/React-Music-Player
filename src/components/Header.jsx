"use client"
import { FaMoon, FaSun, FaMusic } from "react-icons/fa"
import "../styles/Header.css"

const Header = ({ darkMode, toggleTheme }) => {
  return (
    <header className="header">
      <div className="logo">
        <FaMusic className="logo-icon" />
        <h1>Harmony Player</h1>
      </div>
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>
    </header>
  )
}

export default Header

