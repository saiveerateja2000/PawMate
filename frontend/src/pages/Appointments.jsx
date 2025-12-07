import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Appointments(){
  const [appointments, setAppointments] = useState([])
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // form state for booking
  const [petId, setPetId] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    Promise.all([
      api.get('/appointments'),
      api.get('/pets')
    ]).then(([aRes, pRes]) => {
      if(!mounted) return
      setAppointments(Array.isArray(aRes.data) ? aRes.data : [])
      setPets(Array.isArray(pRes.data) ? pRes.data : [])
    }).catch(err => setError(err?.response?.data?.detail || err.message))
      .finally(()=> setLoading(false))
    return () => { mounted = false }
  },[])

  const handleCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    setError(null)
    try{
      if(!petId || !scheduledDate) throw new Error('Select pet and date')
      // scheduledDate is from input[type=date], convert to ISO datetime at midnight UTC
      const iso = new Date(scheduledDate + 'T00:00:00Z').toISOString()
      const res = await api.post('/appointments', { pet_id: parseInt(petId), scheduled_at: iso })
      setAppointments(prev => [res.data, ...prev])
      setPetId('')
      setScheduledDate('')
    }catch(err){
      setError(err?.response?.data?.detail || err.message)
    }finally{ setCreating(false) }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Appointments</h2>

      {loading && <div className="text-gray-500">Loading...</div>}
      {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

      <div className="mb-6 p-4 bg-white rounded shadow">
        <h3 className="font-semibold mb-2">Book an Appointment</h3>
        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select value={petId} onChange={e=>setPetId(e.target.value)} className="p-2 border rounded">
            <option value="">Select pet</option>
            {pets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.species})</option>)}
          </select>
          <input type="date" value={scheduledDate} onChange={e=>setScheduledDate(e.target.value)} className="p-2 border rounded" />
          <div>
            <button className="w-full bg-green-600 text-white p-2 rounded" disabled={creating}>{creating ? 'Booking...' : 'Book'}</button>
          </div>
        </form>
      </div>

      {!loading && appointments.length === 0 && (
        <div className="p-4 bg-blue-50 rounded">No appointments scheduled.</div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {appointments.map(a => (
          <Link key={a.id} to={`/appointments/${a.id}`} className="block p-4 bg-white rounded shadow hover:shadow-lg">
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">Appointment #{a.id}</h3>
                <p className="text-sm text-gray-600">Pet ID: {a.pet_id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{new Date(a.scheduled_at).toLocaleString()}</p>
                <p className="text-sm font-semibold">{a.status}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
