import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Profile(){
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    api.get('/auth/me')
      .then(r => {
        setUser(r.data)
        setError(null)
      })
      .catch(err => {
        setError(err?.response?.data?.detail || err.message)
        // Redirect to login if unauthorized
        if (err?.response?.status === 401) {
          setTimeout(() => navigate('/login'), 2000)
        }
      })
      .finally(() => setLoading(false))
  }, [navigate])

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!currentPassword || !newPassword) {
      setError('Please fill all password fields')
      return
    }
    if (newPassword.length < 6 || newPassword.length > 72) {
      setError('New password must be 6-72 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (currentPassword === newPassword) {
      setError('New password must be different from current password')
      return
    }

    setChangingPassword(true)
    // Note: Backend doesn't have password change endpoint yet. This is for future use.
    try {
      // await api.post('/auth/change-password', { current_password: currentPassword, new_password: newPassword })
      setSuccess('Password change feature coming soon!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err?.response?.data?.detail || err.message)
    } finally {
      setChangingPassword(false)
    }
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('pawmate_token')
      navigate('/')
    }
  }

  if (loading) return <div className="text-center py-12 text-gray-500">⏳ Loading profile...</div>
  if (error && !user) return (
    <div className="max-w-2xl mx-auto">
      <div className="p-6 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
        <p className="font-semibold">❌ Error</p>
        <p>{error}</p>
        <p className="text-sm mt-2">Redirecting to login...</p>
      </div>
    </div>
  )

  return (
    <div className="py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">👤 My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account settings</p>
        </div>

        {error && (
          <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
            <p className="font-semibold">✓ {success}</p>
          </div>
        )}

        {/* User Info Card */}
        <div className="p-6 bg-white rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Account Information</h2>
          <div className="space-y-4">
            <div className="pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-600 font-semibold">Username</p>
              <p className="text-lg text-gray-800">{user?.username || 'N/A'}</p>
            </div>
            <div className="pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-600 font-semibold">Account Type</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg text-gray-800">
                  {user?.is_staff ? '👨‍⚕️ Staff Member' : '👤 Regular User'}
                </span>
                {user?.is_staff && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Admin Access</span>
                )}
              </div>
            </div>
            <div className="pb-4">
              <p className="text-sm text-gray-600 font-semibold">ID</p>
              <p className="text-lg text-gray-600 font-mono">{user?.id || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="p-6 bg-white rounded-lg shadow-md mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
              <input 
                type="password" 
                placeholder="Enter current password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <input 
                type="password" 
                placeholder="Enter new password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
              <p className="text-xs text-gray-500 mt-1">6-72 characters</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
              <input 
                type="password" 
                placeholder="Confirm new password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <button 
              type="submit" 
              disabled={changingPassword}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
            >
              {changingPassword ? '⏳ Updating...' : '🔐 Change Password'}
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-4 text-center">Password change endpoint coming soon in backend</p>
        </div>

        {/* Danger Zone */}
        <div className="p-6 bg-red-50 rounded-lg border border-red-200">
          <h2 className="text-2xl font-bold text-red-800 mb-4">⚠️ Danger Zone</h2>
          <div className="space-y-3">
            <button 
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
            >
              🚪 Logout
            </button>
            <p className="text-sm text-red-700 text-center">
              You will be logged out from all devices
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm">
          <p>Need help? <a href="/about" className="text-blue-600 hover:underline">Contact Support</a></p>
        </div>
      </div>
    </div>
  )
}
