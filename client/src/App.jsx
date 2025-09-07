import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Home from './Pages/HomePage'
import Login from './Pages/LoginPage'
import MainPage from './Pages/MainPage'
import Dashboard from './Pages/Dashboard'
import CollectionView from './Pages/CollectionView'
import NotFound from './Pages/NotFound'
import ProtectedRoute from './utils/ProtectedRoute'

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
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-white text-xl">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!isBackendUp) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-4">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Service Unavailable</h2>
          <p className="text-gray-400">Unable to connect to the backend server. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            // Default options
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f3f4f6',
              border: '1px solid #374151',
            },
            // Success
            success: {
              duration: 3000,
              style: {
                background: '#065f46',
                color: '#ffffff',
                border: '1px solid #10b981',
              },
            },
            // Error
            error: {
              duration: 5000,
              style: {
                background: '#7f1d1d',
                color: '#ffffff',
                border: '1px solid #ef4444',
              },
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/collection/:collectionId" element={
            <ProtectedRoute>
              <CollectionView />
            </ProtectedRoute>
          } />
          <Route path="/chat" element={
            <ProtectedRoute>
              <MainPage />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App