"use client"

import { useState, useEffect } from "react"
import Player from "../components/Player"
import Playlist from "../components/Playlist"
import SearchBar from "../components/SearchBar"
import { FaHeart } from "react-icons/fa"
import songsData from "../data"
import "../styles/Home.css"

const Home = () => {
  const [songs, _setSongs] = useState(songsData)
  const [currentSong, setCurrentSong] = useState(songs[0])
  const [filteredSongs, setFilteredSongs] = useState(songs)
  const [favorites, setFavorites] = useState([])
  const [queue, setQueue] = useState([])
  const [showFavorites, setShowFavorites] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(null)

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("favorites")
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
    } catch (err) {
      console.error("Error loading favorites:", err)
      setError("Failed to load favorites")
    }
  }, [])

  // Save favorites to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem("favorites", JSON.stringify(favorites))
    } catch (err) {
      console.error("Error saving favorites:", err)
      setError("Failed to save favorites")
    }
  }, [favorites])

  const handleSearch = (query) => {
    if (showFavorites) {
      setFilteredSongs(
        favorites.filter(
          (song) =>
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase()),
        ),
      )
    } else {
      setFilteredSongs(
        songs.filter(
          (song) =>
            song.title.toLowerCase().includes(query.toLowerCase()) ||
            song.artist.toLowerCase().includes(query.toLowerCase()),
        ),
      )
    }
  }

  const handleSongEnd = () => {
    if (queue.length > 0) {
      // Play next song in queue
      const nextSong = queue[0]
      const newQueue = queue.slice(1)
      setCurrentSong(nextSong)
      setQueue(newQueue)
      setIsPlaying(true)
    } else {
      // Play next song in playlist
      const currentIndex = songs.findIndex((song) => song.id === currentSong.id)
      const nextIndex = (currentIndex + 1) % songs.length
      setCurrentSong(songs[nextIndex])
      setIsPlaying(true)
    }
  }

  const handlePrevSong = () => {
    const currentIndex = songs.findIndex((song) => song.id === currentSong.id)
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length
    setCurrentSong(songs[prevIndex])
    setIsPlaying(true)
  }

  const handleNextSong = () => {
    if (queue.length > 0) {
      // Play next song in queue
      const nextSong = queue[0]
      const newQueue = queue.slice(1)
      setCurrentSong(nextSong)
      setQueue(newQueue)
      setIsPlaying(true)
    } else {
      // Play next song in playlist
      const currentIndex = songs.findIndex((song) => song.id === currentSong.id)
      const nextIndex = (currentIndex + 1) % songs.length
      setCurrentSong(songs[nextIndex])
      setIsPlaying(true)
    }
  }

  const toggleFavorite = (song) => {
    try {
      const isFavorite = favorites.some((fav) => fav.id === song.id)

      if (isFavorite) {
        setFavorites(favorites.filter((fav) => fav.id !== song.id))
      } else {
        setFavorites([...favorites, song])
      }
    } catch (err) {
      console.error("Error toggling favorite:", err)
      setError("Failed to update favorites")
    }
  }

  const addToQueue = (song) => {
    try {
      // Don't add if it's the current song or already in queue
      if (song.id === currentSong.id || queue.some((item) => item.id === song.id)) {
        return
      }

      setQueue([...queue, song])
    } catch (err) {
      console.error("Error adding to queue:", err)
      setError("Failed to add to queue")
    }
  }

  const toggleFavoritesView = () => {
    setShowFavorites(!showFavorites)
    if (!showFavorites) {
      setFilteredSongs(favorites)
    } else {
      setFilteredSongs(songs)
    }
  }

  const selectSong = (song) => {
    setCurrentSong(song)
    setIsPlaying(true)
  }

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="home-container">
      {error && (
        <div className="error-notification">
          {error}
          <button onClick={() => setError(null)} className="close-error">
            ×
          </button>
        </div>
      )}

      <div className="top-section">
        <SearchBar onSearch={handleSearch} songs={songs} />
        <button className={`favorites-toggle ${showFavorites ? "active" : ""}`} onClick={toggleFavoritesView}>
          <FaHeart className="favorites-icon" />
          <span>Favorites</span>
        </button>
      </div>

      <div className="main-content">
        <Player
          currentSong={currentSong}
          onEnded={handleSongEnd}
          onPrev={handlePrevSong}
          onNext={handleNextSong}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          queue={queue}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
        />

        <h2 className="section-title">{showFavorites ? "Your Favorites" : "All Songs"}</h2>

        <Playlist
          songs={filteredSongs}
          selectSong={selectSong}
          currentSong={currentSong}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          addToQueue={addToQueue}
        />
      </div>
    </div>
  )
}

export default Home

