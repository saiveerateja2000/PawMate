import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Auth(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  const validatePassword = (pwd) => {
    if (pwd.length < 6) return 'Password must be at least 6 characters'
    if (pwd.length > 72) return 'Password cannot exceed 72 characters'
    return null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    if (mode === 'signup') {
      if (!username || username.length < 3) {
        setError('Username must be at least 3 characters')
        return
      }
      const pwdError = validatePassword(password)
      if (pwdError) {
        setError(pwdError)
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match')
        return
      }
      
      setLoading(true)
      api.post('/auth/register', { username, password })
        .then(() => {
          setSuccess('Registration successful! Switching to login...')
          setTimeout(() => {
            setMode('login')
            setPassword('')
            setConfirmPassword('')
            setSuccess(null)
          }, 2000)
        })
        .catch(err => setError(err?.response?.data?.detail || err.message))
        .finally(() => setLoading(false))
    } else {
      if (!username || !password) {
        setError('Username and password required')
        return
      }
      setLoading(true)
      const params = new URLSearchParams()
      params.append('username', username)
      params.append('password', password)
      api.post('/auth/token', params, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
        .then(res => {
          const token = res.data?.access_token
          if (token) {
            localStorage.setItem('pawmate_token', token)
            navigate('/dashboard')
          }
        })
        .catch(err => setError(err?.response?.data?.detail || err.message))
        .finally(() => setLoading(false))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">🐾 PawMate</h1>
          <h2 className="text-2xl font-semibold text-gray-800">{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg text-sm">
            <p className="font-semibold">✓ {success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
            <input 
              type="text" 
              placeholder="Enter username" 
              required 
              value={username} 
              onChange={(e)=>setUsername(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              minLength={3}
              maxLength={50}
            />
            <p className="text-xs text-gray-500 mt-1">3-50 characters</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <input 
              type="password" 
              placeholder="Enter password" 
              required 
              value={password} 
              onChange={(e)=>setPassword(e.target.value)} 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              minLength={6}
              maxLength={72}
            />
            <p className="text-xs text-gray-500 mt-1">6-72 characters</p>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
              <input 
                type="password" 
                placeholder="Confirm password" 
                required 
                value={confirmPassword} 
                onChange={(e)=>setConfirmPassword(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
            >
              {loading ? '⏳ Processing...' : (mode === 'login' ? '🔐 Login' : '✓ Sign Up')}
            </button>
            <button 
              type="button" 
              onClick={()=>{
                setMode(mode === 'login' ? 'signup' : 'login')
                setError(null)
                setSuccess(null)
              }} 
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 font-semibold transition"
            >
              {mode === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
