import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api'
import PetForm from '../components/PetForm'

export default function Home() {
  const navigate = useNavigate()
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [speciesFilter, setSpeciesFilter] = useState('')
  const [token] = useState(typeof window !== 'undefined' ? localStorage.getItem('pawmate_token') : null)

  const fetchPets = () => {
    setLoading(true)
    api.get('/pets')
      .then(r => {
        setPets(Array.isArray(r.data) ? r.data : [])
        setError(null)
      })
      .catch(err => {
        setError(`Failed to load pets: ${err?.response?.data?.detail || err.message}`)
        setPets([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchPets()
  }, [])

  const handleFormSuccess = () => {
    setShowForm(false)
    fetchPets()
  }

  const handleDelete = async (petId, e) => {
    e.preventDefault()
    if(!window.confirm('Are you sure?')) return
    try {
      await api.delete(`/pets/${petId}`)
      setPets(prev => prev.filter(p => p.id !== petId))
    } catch(err) {
      alert('Failed to delete: ' + (err?.response?.data?.detail || err.message))
    }
  }

  const filteredPets = speciesFilter
    ? pets.filter(p => p.species.toLowerCase().includes(speciesFilter.toLowerCase()))
    : pets

  const species = [...new Set(pets.map(p => p.species))].sort()

  return (
    <div className="py-2">
      <div className="mb-8">
        <div className="flex gap-4 items-center justify-between flex-wrap mb-4">
          <h2 className="text-4xl font-bold text-gray-800">🐾 Pet Registry</h2>
          {token && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow"
            >
              {showForm ? '✕ Cancel' : '+ Add Pet'}
            </button>
          )}
        </div>

        {showForm && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border-l-4 border-green-600">
            <PetForm onSuccess={handleFormSuccess} onCancel={() => setShowForm(false)} />
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 text-lg">Loading pets...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
          <p className="font-semibold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && species.length > 0 && (
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setSpeciesFilter('')}
            className={`px-4 py-2 rounded-lg transition font-medium ${speciesFilter === '' ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            All ({pets.length})
          </button>
          {species.map(s => (
            <button
              key={s}
              onClick={() => setSpeciesFilter(s)}
              className={`px-4 py-2 rounded-lg transition font-medium ${speciesFilter === s ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {s} ({pets.filter(p => p.species === s).length})
            </button>
          ))}
        </div>
      )}

      {!loading && !error && filteredPets.length === 0 && (
        <div className="p-8 bg-blue-50 border-l-4 border-blue-500 text-blue-700 rounded-lg text-center">
          <p className="text-lg font-semibold">
            {speciesFilter ? '🔍 No pets found with that species.' : '📋 No pets found. Create one to get started!'}
          </p>
        </div>
      )}

      {!loading && filteredPets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPets.map(p => (
            <div
              key={p.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition transform hover:-translate-y-1 overflow-hidden group"
            >
              <Link to={`/pet/${p.id}`} className="block">
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-blue-50 overflow-hidden">
                  {p.image ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/pets/${p.id}/image`}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition transform"
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {p.species?.toLowerCase().includes('dog') ? '🐕' : p.species?.toLowerCase().includes('cat') ? '🐱' : '🐾'}
                    </div>
                  )}
                </div>
              </Link>
              
              <div className="p-4">
                <Link to={`/pet/${p.id}`}>
                  <h3 className="font-bold text-xl text-gray-800 mb-1 group-hover:text-blue-600 transition">{p.name || 'Unnamed'}</h3>
                </Link>
                <p className="text-gray-600 text-sm mb-4">
                  <span className="font-semibold">{p.species || 'Unknown'}</span> • {p.age ? `${p.age} yrs` : 'Age unknown'}
                </p>

                <div className="flex gap-2">
                  <Link
                    to={`/pet/${p.id}`}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition text-center font-medium"
                  >
                    View
                  </Link>
                  {token && (
                    <button
                      onClick={(e) => handleDelete(p.id, e)}
                      className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
