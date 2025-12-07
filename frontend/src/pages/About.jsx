import React from 'react'

export default function About(){
  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">🐾 About PawMate</h1>
          <p className="text-xl text-gray-600">Your trusted companion for pet care management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed">
              PawMate is dedicated to helping pet owners manage their furry friends' health, appointments, and memories in one beautiful, easy-to-use platform. We believe every pet deserves the best care.
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Why Choose Us?</h2>
            <ul className="text-gray-600 space-y-2 leading-relaxed">
              <li>✅ Simple & intuitive interface</li>
              <li>✅ Secure pet health records</li>
              <li>✅ Easy appointment scheduling</li>
              <li>✅ Photo galleries for memories</li>
            </ul>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg shadow-lg text-center mb-12">
          <h2 className="text-2xl font-bold mb-4">Features at a Glance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-4xl mb-2">📋</div>
              <h3 className="font-bold mb-2">Pet Registry</h3>
              <p className="text-sm">Store pet info, photos, and health details</p>
            </div>
            <div>
              <div className="text-4xl mb-2">📅</div>
              <h3 className="font-bold mb-2">Appointments</h3>
              <p className="text-sm">Book and manage vet appointments easily</p>
            </div>
            <div>
              <div className="text-4xl mb-2">📊</div>
              <h3 className="font-bold mb-2">Health Records</h3>
              <p className="text-sm">Keep medical history and treatment notes</p>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Contact & Support</h2>
          <p className="text-gray-600 mb-4">Have questions or suggestions? We'd love to hear from you!</p>
          <div className="flex gap-4">
            <a href="mailto:support@pawmate.app" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold">📧 Email Us</a>
            <a href="#" className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold">💬 Discord Community</a>
          </div>
        </div>

        <div className="text-center mt-12 text-gray-600">
          <p className="text-sm">PawMate © 2025 • Built with ❤️ for pet lovers everywhere</p>
        </div>
      </div>
    </div>
  )
}
