import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function Landing(){
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [token] = useState(typeof window !== 'undefined' ? localStorage.getItem('pawmate_token') : null)

  useEffect(()=>{
    api.get('/pets?skip=0&limit=6')
      .then(r => setFeatured(Array.isArray(r.data) ? r.data : []))
      .catch(()=>{})
      .finally(()=> setLoading(false))
  },[])

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white py-24">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">🐾 Welcome to PawMate</h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-2xl mx-auto">Your trusted companion app for pet care, health records, and appointment management—all in one place.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/pets" className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:shadow-lg hover:scale-105 transition transform">
              🐕 Browse Pets
            </Link>
            {!token && (
              <Link to="/login" className="px-8 py-4 bg-blue-400 text-white rounded-lg font-bold text-lg hover:bg-blue-300 hover:scale-105 transition transform">
                👤 Get Started
              </Link>
            )}
            {token && (
              <Link to="/add-pet" className="px-8 py-4 bg-green-400 text-white rounded-lg font-bold text-lg hover:bg-green-300 hover:scale-105 transition transform">
                ➕ Add Your Pet
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">Why Choose PawMate?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Pet Registry</h3>
              <p className="text-gray-600">Organize all your pets in one place. Upload photos, track age, species, and health details.</p>
            </div>
            <div className="p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Appointments</h3>
              <p className="text-gray-600">Book, track, and manage vet appointments effortlessly. Never miss an important date.</p>
            </div>
            <div className="p-8 bg-white rounded-lg shadow-md hover:shadow-lg transition">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-2xl font-bold mb-3 text-gray-800">Health Records</h3>
              <p className="text-gray-600">Keep medical notes, diagnoses, and treatment history for each pet in one secure location.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Pets Section */}
      {featured.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">✨ Featured Pets</h2>
            {loading ? (
              <div className="flex justify-center py-12"><p className="text-gray-500">Loading pets...</p></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featured.map(p => (
                  <Link key={p.id} to={`/pet/${p.id}`} className="group">
                    <div className="relative bg-white rounded-lg shadow-md hover:shadow-lg overflow-hidden transition">
                      <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden">
                        {p.image ? (
                          <img
                            src={`${import.meta.env.VITE_API_URL}/pets/${p.id}/image`}
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition transform"
                            onError={(e) => { e.target.style.display = 'none' }}
                          />
                        ) : (
                          <div className="text-6xl">🐾</div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition">{p.name}</h3>
                        <p className="text-sm text-gray-600">{p.species} • {p.age ? `${p.age} yrs` : 'Age unknown'}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Join PawMate?</h2>
          <p className="text-xl mb-8 text-blue-100">Start managing your pets' care today with our simple and intuitive platform.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!token ? (
              <>
                <Link to="/login" className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:shadow-lg transition">
                  Sign In
                </Link>
                <a href="#" className="px-8 py-3 bg-blue-400 text-white rounded-lg font-bold hover:bg-blue-300 transition">
                  Learn More
                </a>
              </>
            ) : (
              <Link to="/pets" className="px-8 py-3 bg-white text-blue-600 rounded-lg font-bold hover:shadow-lg transition">
                Explore All Pets
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-8 text-center">
        <p className="text-sm">© 2025 PawMate. Crafted with ❤️ for pet lovers everywhere.</p>
      </footer>
    </div>
  )
}
