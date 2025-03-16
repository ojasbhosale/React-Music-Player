"use client"

import { useState } from "react"
import { FaHeart, FaPlay, FaEllipsisH, FaPlus } from "react-icons/fa"
import "../styles/Playlist.css"

const Playlist = ({ songs, selectSong, currentSong, favorites, toggleFavorite, addToQueue }) => {
  const [sortBy, setSortBy] = useState("default")
  const [activeGenre, setActiveGenre] = useState("all")

  // Get unique genres
  const genres = ["all", ...new Set(songs.map((song) => song.genre))]

  // Sort and filter songs
  const getSortedAndFilteredSongs = () => {
    let filteredSongs = [...songs]

    // Filter by genre
    if (activeGenre !== "all") {
      filteredSongs = filteredSongs.filter((song) => song.genre === activeGenre)
    }

    // Sort songs
    switch (sortBy) {
      case "title":
        return filteredSongs.sort((a, b) => a.title.localeCompare(b.title))
      case "artist":
        return filteredSongs.sort((a, b) => a.artist.localeCompare(b.artist))
      case "newest":
        return filteredSongs.sort((a, b) => new Date(b.added) - new Date(a.added))
      default:
        return filteredSongs
    }
  }

  const sortedSongs = getSortedAndFilteredSongs()

  return (
    <div className="playlist-container">
      <div className="playlist-header">
        <div className="genre-filter">
          {genres.map((genre) => (
            <button
              key={genre}
              className={`genre-btn ${activeGenre === genre ? "active" : ""}`}
              onClick={() => setActiveGenre(genre)}
            >
              {genre.charAt(0).toUpperCase() + genre.slice(1)}
            </button>
          ))}
        </div>
        <div className="sort-options">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="default">Default</option>
            <option value="title">Title</option>
            <option value="artist">Artist</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div className="songs-list">
        {sortedSongs.length > 0 ? (
          sortedSongs.map((song) => {
            const isPlaying = currentSong && currentSong.id === song.id
            const isFavorite = favorites.some((fav) => fav.id === song.id)

            return (
              <div key={song.id} className={`song-card ${isPlaying ? "playing" : ""}`}>
                <div className="song-card-left" onClick={() => selectSong(song)}>
                  <div className="song-thumbnail-container">
                    <img src={song.cover || "/placeholder.svg"} alt={song.title} className="song-thumbnail" />
                    <div className="play-overlay">
                      <FaPlay className="play-icon" />
                    </div>
                    {isPlaying && <div className="now-playing-indicator">Now Playing</div>}
                  </div>
                  <div className="song-details">
                    <h4 className="song-title">{song.title}</h4>
                    <p className="song-artist">{song.artist}</p>
                    {song.album && <p className="song-album">{song.album}</p>}
                  </div>
                </div>
                <div className="song-card-right">
                  <button
                    className={`action-btn favorite-btn ${isFavorite ? "active" : ""}`}
                    onClick={() => toggleFavorite(song)}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  >
                    <FaHeart />
                  </button>
                  <button className="action-btn queue-btn" onClick={() => addToQueue(song)} aria-label="Add to queue">
                    <FaPlus />
                  </button>
                  <div className="song-menu">
                    <button className="action-btn menu-btn">
                      <FaEllipsisH />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <div className="no-songs">No songs found</div>
        )}
      </div>
    </div>
  )
}

export default Playlist

