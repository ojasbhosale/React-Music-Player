"use client"

import { useState, useRef, useEffect } from "react"
import {
  FaHeart,
  FaRegHeart,
  FaStepBackward,
  FaStepForward,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa"
import "../styles/Player.css"

const Player = ({
  currentSong,
  onEnded,
  onNext,
  onPrev,
  favorites,
  toggleFavorite,
  queue,
  isPlaying,
  setIsPlaying,
}) => {
  const [volume, setVolume] = useState(80)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)

  const audioRef = useRef(new Audio())
  const progressRef = useRef(null)
  const animationRef = useRef(null)

  // Load saved volume on component mount
  useEffect(() => {
    const savedVolume = localStorage.getItem("playerVolume")
    if (savedVolume) {
      const parsedVolume = Number.parseInt(savedVolume)
      setVolume(parsedVolume)
      audioRef.current.volume = parsedVolume / 100
    }

    // Set up audio event listeners
    const audio = audioRef.current

    audio.addEventListener("error", handleAudioError)
    audio.addEventListener("loadeddata", handleAudioLoaded)
    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("ended", handleAudioEnded)
    audio.addEventListener("loadstart", () => setLoading(true))
    audio.addEventListener("canplay", () => setLoading(false))

    return () => {
      // Clean up event listeners and cancel animation frame on unmount
      audio.removeEventListener("error", handleAudioError)
      audio.removeEventListener("loadeddata", handleAudioLoaded)
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("ended", handleAudioEnded)
      audio.removeEventListener("loadstart", () => setLoading(true))
      audio.removeEventListener("canplay", () => setLoading(false))

      cancelAnimationFrame(animationRef.current)

      // Stop and reset audio on unmount
      audio.pause()
      audio.currentTime = 0
      audio.src = ""
    }
  }, [])

  // Handle song changes
  useEffect(() => {
    if (!currentSong) return

    setError(false)
    setLoading(true)

    // Stop current audio and cancel animation
    audioRef.current.pause()
    cancelAnimationFrame(animationRef.current)

    // Reset time display
    setCurrentTime(0)
    setDuration(0)

    // Set new source
    audioRef.current.src = currentSong.src

    // Load and play new audio
    const playPromise = audioRef.current.load()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (isPlaying) {
            audioRef.current.play().catch((err) => {
              console.error("Error playing audio:", err)
              setError(true)
              setIsPlaying(false)
            })
          }
        })
        .catch((err) => {
          console.error("Error loading audio:", err)
          setError(true)
          setIsPlaying(false)
        })
    }
  }, [currentSong, isPlaying, setIsPlaying])

  // Handle play/pause state changes
  useEffect(() => {
    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error("Error playing audio:", err)
        setError(true)
        setIsPlaying(false)
      })
      animationRef.current = requestAnimationFrame(whilePlaying)
    } else {
      audioRef.current.pause()
      cancelAnimationFrame(animationRef.current)
    }
  }, [isPlaying])

  const handleAudioError = () => {
    console.error("Audio error occurred")
    setError(true)
    setLoading(false)
    setIsPlaying(false)
  }

  const handleAudioLoaded = () => {
    setDuration(audioRef.current.duration)
    setLoading(false)

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error("Error playing audio after load:", err)
        setError(true)
        setIsPlaying(false)
      })
    }
  }

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime)
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
    cancelAnimationFrame(animationRef.current)
    onEnded()
  }

  const whilePlaying = () => {
    if (progressRef.current) {
      progressRef.current.value = audioRef.current.currentTime
      setCurrentTime(audioRef.current.currentTime)
    }
    animationRef.current = requestAnimationFrame(whilePlaying)
  }

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value
    setVolume(newVolume)
    audioRef.current.volume = newVolume / 100
    localStorage.setItem("playerVolume", newVolume)

    // Update mute state based on volume
    if (newVolume === "0") {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  const togglePlay = () => {
    if (error) {
      // Try to reload the audio if there was an error
      setError(false)
      audioRef.current.load()
    }
    setIsPlaying(!isPlaying)
  }

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current.volume = volume / 100
      setIsMuted(false)
    } else {
      audioRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const handleProgressChange = (e) => {
    const value = e.target.value
    setCurrentTime(value)
    audioRef.current.currentTime = value
  }

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  if (!currentSong) return <div className="player-error">No song selected</div>

  const isFavorite = favorites.some((fav) => fav.id === currentSong.id)

  return (
    <div className={`player-card ${error ? "player-error-state" : ""} ${loading ? "player-loading" : ""}`}>
      <div className="player-top">
        <div className="player-cover-container">
          <img
            src={currentSong.cover || "/placeholder.svg"}
            alt={currentSong.title}
            className="player-cover"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = "/placeholder.svg"
            }}
          />
          <div className="player-cover-overlay">
            <button
              className="favorite-btn"
              onClick={() => toggleFavorite(currentSong)}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isFavorite ? <FaHeart className="favorite-icon active" /> : <FaRegHeart className="favorite-icon" />}
            </button>
          </div>

          {loading && (
            <div className="loading-overlay">
              <div className="loading-spinner"></div>
            </div>
          )}
        </div>

        <div className="player-info">
          <h3 className="song-title">{currentSong.title}</h3>
          <p className="song-artist">{currentSong.artist}</p>
          {currentSong.album && <p className="song-album">{currentSong.album}</p>}
          <div className="song-genre">{currentSong.genre}</div>

          {error && <div className="error-message">Error playing this track. Please try again.</div>}
        </div>
      </div>

      <div className="player-controls">
        <div className="progress-container">
          <span className="time-display">{formatTime(currentTime)}</span>
          <input
            type="range"
            ref={progressRef}
            className="progress-bar"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleProgressChange}
            disabled={error || loading}
          />
          <span className="time-display">{formatTime(duration)}</span>
        </div>

        <div className="volume-control">
          <button className="volume-btn" onClick={toggleMute} aria-label={isMuted ? "Unmute" : "Mute"}>
            {isMuted ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="volume-slider"
            aria-label="Volume control"
          />
          <span className="volume-value">{volume}%</span>
        </div>

        <div className="navigation-controls">
          <button className="nav-button" onClick={onPrev} disabled={!onPrev} aria-label="Previous song">
            <FaStepBackward />
          </button>

          <button className="play-button" onClick={togglePlay} aria-label={isPlaying ? "Pause" : "Play"}>
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          <button
            className="nav-button"
            onClick={onNext}
            disabled={!onNext || (queue.length === 0 && !currentSong)}
            aria-label="Next song"
          >
            <FaStepForward />
          </button>
        </div>
      </div>

      {queue.length > 0 && (
        <div className="up-next">
          <h4>Up Next:</h4>
          <p>
            {queue[0]?.title} - {queue[0]?.artist}
          </p>
        </div>
      )}
    </div>
  )
}

export default Player

