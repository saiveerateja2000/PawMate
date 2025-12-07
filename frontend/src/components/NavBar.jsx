import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'

export default function NavBar(){
  const navigate = useNavigate()
  const [token, setToken] = useState(typeof window !== 'undefined' ? localStorage.getItem('pawmate_token') : null)
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(r => setUser(r.data))
        .catch(() => {})
    }
  }, [token])

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('pawmate_token')
      setToken(null)
      setUser(null)
      navigate('/')
    }
  }

  return (
    <nav className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition">
            🐾 PawMate
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/pets" className="text-gray-700 hover:text-blue-600 font-medium transition">🐾 Pets</Link>
            <Link to="/appointments" className="text-gray-700 hover:text-blue-600 font-medium transition">📅 Appointments</Link>
            <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium transition">ℹ️ About</Link>
          </div>

          {/* Auth Menu */}
          <div className="flex items-center gap-4">
            {token ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="hidden md:block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">Dashboard</Link>
                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    👤 {user?.username || 'User'}
                    <span className="text-xs">▼</span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border border-gray-200">
                      <div className="px-4 py-3 border-b text-sm text-gray-600">
                        <p className="font-semibold">{user?.username}</p>
                        <p className="text-xs">{user?.is_staff ? '👨‍⚕️ Staff' : '👤 User'}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 hover:bg-blue-50 text-gray-700">👤 My Profile</Link>
                      <Link to="/dashboard" className="block px-4 py-2 hover:bg-blue-50 text-gray-700 md:hidden">📊 Dashboard</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-semibold">🚪 Logout</button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link to="/login" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold">Login</Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t pt-4">
            <Link to="/pets" className="block px-3 py-2 hover:bg-gray-100 rounded">🐾 Pets</Link>
            <Link to="/appointments" className="block px-3 py-2 hover:bg-gray-100 rounded">📅 Appointments</Link>
            <Link to="/about" className="block px-3 py-2 hover:bg-gray-100 rounded">ℹ️ About</Link>
            {token && <Link to="/dashboard" className="block px-3 py-2 hover:bg-gray-100 rounded">📊 Dashboard</Link>}
          </div>
        )}
      </div>
    </nav>
  )
}
