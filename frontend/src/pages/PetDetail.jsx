import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import PetForm from '../components/PetForm'

export default function PetDetail() {
  const { petId } = useParams()
  const navigate = useNavigate()
  const [pet, setPet] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    api.get(`/pets/${petId}`)
      .then(r => {
        setPet(r.data)
        setError(null)
      })
      .catch(err => setError(`Failed to load pet: ${err?.response?.data?.detail || err.message}`))
      .finally(() => setLoading(false))
  }, [petId])

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this pet?')) return

    try {
      await api.delete(`/pets/${petId}`)
      navigate('/pets')
    } catch (err) {
      setError(`Failed to delete pet: ${err?.response?.data?.detail || err.message}`)
    }
  }

  const handleEditSuccess = () => {
    setIsEditing(false)
    api.get(`/pets/${petId}`)
      .then(r => setPet(r.data))
      .catch(err => setError(`Failed to reload pet: ${err?.response?.data?.detail || err.message}`))
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading...</div>
  if (error) return <div className="p-4 bg-red-100 text-red-700 rounded">{error}</div>
  if (!pet) return <div className="text-center py-8 text-gray-500">Pet not found</div>

  return (
    <div className="max-w-2xl mx-auto">
      {isEditing ? (
        <PetForm
          pet={pet}
          onSuccess={handleEditSuccess}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="p-6 bg-white rounded shadow">
          {pet.image ? (
            <img
              src={`${import.meta.env.VITE_API_URL}/pets/${petId}/image`}
              alt={pet.name}
              className="w-full h-64 object-cover rounded mb-4"
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 rounded mb-4 flex items-center justify-center">
              <span className="text-gray-400">No image</span>
            </div>
          )}

          <h1 className="text-3xl font-bold mb-2">{pet.name}</h1>
          <div className="mb-4 text-gray-600">
            <p className="text-lg">
              <strong>Species:</strong> {pet.species}
            </p>
            <p className="text-lg">
              <strong>Age:</strong> {pet.age ?? 'Unknown'}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            >
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
