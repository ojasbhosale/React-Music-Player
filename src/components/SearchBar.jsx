"use client"

import { useState, useRef, useEffect } from "react"
import { FaSearch, FaTimes } from "react-icons/fa"
import "../styles/SearchBar.css"

const SearchBar = ({ onSearch, songs }) => {
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const inputRef = useRef(null)
  const suggestionsRef = useRef(null)

  useEffect(() => {
    // Handle clicks outside of suggestions
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleChange = (e) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)

    // Generate suggestions
    if (value.trim() !== "") {
      const filtered = songs
        .filter(
          (song) =>
            song.title.toLowerCase().includes(value.toLowerCase()) ||
            song.artist.toLowerCase().includes(value.toLowerCase()),
        )
        .slice(0, 5)

      setSuggestions(filtered)
      setShowSuggestions(true)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const clearSearch = () => {
    setQuery("")
    onSearch("")
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current.focus()
  }

  const handleSuggestionClick = (song) => {
    setQuery(song.title)
    onSearch(song.title)
    setShowSuggestions(false)
  }

  const handleFocus = () => {
    if (query.trim() !== "" && suggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  return (
    <div className="search-container">
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search by song or artist..."
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          className="search-input"
        />
        {query && (
          <button className="clear-btn" onClick={clearSearch} aria-label="Clear search">
            <FaTimes />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="suggestions" ref={suggestionsRef}>
          {suggestions.map((song) => (
            <div key={song.id} className="suggestion-item" onClick={() => handleSuggestionClick(song)}>
              <img src={song.cover || "/placeholder.svg"} alt={song.title} className="suggestion-img" />
              <div className="suggestion-text">
                <div className="suggestion-title">{song.title}</div>
                <div className="suggestion-artist">{song.artist}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SearchBar

