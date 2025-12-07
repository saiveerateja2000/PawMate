import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Dashboard(){
  const [stats, setStats] = useState({ petsCount: 0, appointmentsCount: 0, upcomingCount: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(()=>{
    setLoading(true)
    Promise.all([
      api.get('/pets'),
      api.get('/appointments'),
      api.get('/auth/me')
    ])
    .then(([pRes, aRes, uRes]) => {
      const pets = Array.isArray(pRes.data) ? pRes.data : []
      const appointments = Array.isArray(aRes.data) ? aRes.data : []
      const upcoming = appointments.filter(a => new Date(a.scheduled_at) > new Date()).length
      setStats({
        petsCount: pets.length,
        appointmentsCount: appointments.length,
        upcomingCount: upcoming
      })
      setUser(uRes.data)
    })
    .catch(err => setError(err?.response?.data?.detail || err.message))
    .finally(()=>setLoading(false))
  },[])

  return (
    <div className="py-2">
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-gray-800">📊 Dashboard</h2>
        {user && <p className="text-gray-600 mt-2">Welcome, <span className="font-semibold">{user.username}</span> {user.is_staff && <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">👨‍⚕️ Staff</span>}</p>}
      </div>

      {error && <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md border-l-4 border-blue-600">
          <h3 className="text-sm text-gray-600 font-semibold mb-1">🐾 Total Pets</h3>
          <p className="text-4xl font-bold text-blue-600">{loading ? '...' : stats.petsCount}</p>
          <p className="text-xs text-gray-600 mt-2">Registered in system</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md border-l-4 border-green-600">
          <h3 className="text-sm text-gray-600 font-semibold mb-1">📅 All Appointments</h3>
          <p className="text-4xl font-bold text-green-600">{loading ? '...' : stats.appointmentsCount}</p>
          <p className="text-xs text-gray-600 mt-2">Total created</p>
        </div>
        <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md border-l-4 border-purple-600">
          <h3 className="text-sm text-gray-600 font-semibold mb-1">⏰ Upcoming (7 days)</h3>
          <p className="text-4xl font-bold text-purple-600">{loading ? '...' : stats.upcomingCount}</p>
          <p className="text-xs text-gray-600 mt-2">Need attention</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="flex flex-col gap-3">
            <Link to="/add-pet" className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-center">➕ Add New Pet</Link>
            <Link to="/appointments" className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold text-center">📅 Manage Appointments</Link>
            <Link to="/pets" className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold text-center">👀 View All Pets</Link>
          </div>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Account Info</h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold text-gray-600">Username:</span> {user?.username || 'Loading...'}</p>
            <p><span className="font-semibold text-gray-600">Role:</span> {user?.is_staff ? '👨‍⚕️ Staff Member' : '👤 Regular User'}</p>
            <p className="text-xs text-gray-500 mt-4">Account created and managed via login page</p>
          </div>
        </div>
      </div>
    </div>
  )
}
