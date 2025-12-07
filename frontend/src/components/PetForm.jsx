import React, { useState } from 'react'
import api from '../api'

export default function PetForm({ pet = null, onSuccess, onCancel }) {
  const [name, setName] = useState(pet?.name || '')
  const [species, setSpecies] = useState(pet?.species || '')
  const [age, setAge] = useState(pet?.age || '')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('species', species)
      if (age) formData.append('age', parseInt(age))
      if (image) formData.append('image', image)

      const url = pet ? `/pets/${pet.id}` : `/pets`
      const method = pet ? 'put' : 'post'

      await api[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (onSuccess) onSuccess()
    } catch (err) {
      setError(`Failed to ${pet ? 'update' : 'create'} pet: ${err?.response?.data?.detail || err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-800">{pet ? '✏️ Edit Pet' : '➕ Add New Pet'}</h2>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
          <p className="font-semibold">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Pet Name *</label>
          <input
            type="text"
            placeholder="e.g., Max, Bella, Whiskers"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Species *</label>
          <input
            type="text"
            placeholder="e.g., Cat, Dog, Rabbit, Bird"
            value={species}
            onChange={(e) => setSpecies(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Age (optional)</label>
          <input
            type="number"
            placeholder="e.g., 3"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="0"
            max="50"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Photo (optional)</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
            id="image-input"
          />
          <label htmlFor="image-input" className="cursor-pointer text-gray-600 text-sm">
            Click to upload an image
          </label>
        </div>
        {imagePreview && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
            <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition"
        >
          {loading ? '💾 Saving...' : '✓ Save Pet'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-400 text-white py-3 rounded-lg hover:bg-gray-500 font-semibold transition"
          >
            ✕ Cancel
          </button>
        )}
      </div>
    </form>
  )
}
