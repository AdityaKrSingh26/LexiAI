import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Pages/HomePage'
import Login from './Pages/LoginPage'
import MainPage from './Pages/MainPage'
import NotFound from './Pages/NotFound'

// Get backend URL from environment variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isBackendUp, setIsBackendUp] = useState(false)

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/health`)
        if (response.ok) {
          setIsBackendUp(true)
        }
      } catch (error) {
        console.error('Backend health check failed:', error)
        setIsBackendUp(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkBackendHealth()
    // Poll backend health every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <h2>Loading...</h2>
      </div>
    )
  }

  if (!isBackendUp) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <h2>Service Unavailable</h2>
        <p>Unable to connect to the backend server. Please try again later.</p>
      </div>
    )
  }

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<MainPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App