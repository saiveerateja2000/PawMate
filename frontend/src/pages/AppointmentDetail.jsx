import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'

export default function AppointmentDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [appointment, setAppointment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [treatment, setTreatment] = useState('')

  useEffect(()=>{
    let mounted = true
    api.get(`/appointments/${id}`)
      .then(r => {
        if(!mounted) return
        setAppointment(r.data)
        setStatus(r.data.status)
        setDiagnosis(r.data.diagnosis || '')
        setTreatment(r.data.treatment || '')
      })
      .catch(err => setError(err?.response?.data?.detail || err.message))
      .finally(()=>{ if(mounted) setLoading(false) })
    return ()=> mounted = false
  },[id])

  const handleSave = async () => {
    try{
      await api.put(`/appointments/${id}`, {
        pet_id: appointment.pet_id,
        scheduled_at: appointment.scheduled_at,
        status,
        diagnosis,
        treatment
      })
      navigate('/appointments')
    }catch(err){
      setError(err?.response?.data?.detail || err.message)
    }
  }

  const handleDelete = async () => {
    if(!window.confirm('Delete appointment?')) return
    try{
      await api.delete(`/appointments/${id}`)
      navigate('/appointments')
    }catch(err){
      setError(err?.response?.data?.detail || err.message)
    }
  }

  if(loading) return <div className="text-gray-500">Loading...</div>
  if(error) return <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>
  if(!appointment) return <div className="text-gray-500">Appointment not found</div>

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Appointment #{appointment.id}</h2>
      <div className="p-4 bg-white rounded shadow mb-4">
        <p><strong>Pet ID:</strong> {appointment.pet_id}</p>
        <p><strong>Scheduled At:</strong> {new Date(appointment.scheduled_at).toLocaleString()}</p>
      </div>

      <div className="p-4 bg-white rounded shadow space-y-3">
        <label className="block">Status</label>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full p-2 border rounded">
          <option value="scheduled">scheduled</option>
          <option value="confirmed">confirmed</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>

        <label>Diagnosis</label>
        <textarea value={diagnosis} onChange={e=>setDiagnosis(e.target.value)} className="w-full p-2 border rounded" />

        <label>Treatment</label>
        <textarea value={treatment} onChange={e=>setTreatment(e.target.value)} className="w-full p-2 border rounded" />

        <div className="flex gap-2">
          <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2 rounded">Save</button>
          <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-2 rounded">Delete</button>
        </div>
      </div>
    </div>
  )
}
