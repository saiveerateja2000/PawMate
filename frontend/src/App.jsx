import React from 'react'
import { Routes, Route } from 'react-router-dom'
import NavBar from './components/NavBar'
import Landing from './pages/Landing'
import PetListView from './pages/PetListView'
import PetDetail from './pages/PetDetail'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import AddPetPage from './pages/AddPetPage'
import Appointments from './pages/Appointments'
import AppointmentDetail from './pages/AppointmentDetail'
import About from './pages/About'
import Profile from './pages/Profile'

export default function App(){
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="max-w-7xl mx-auto p-6">
        <Routes>
          <Route path="/" element={<Landing/>} />
          <Route path="/pets" element={<PetListView/>} />
          <Route path="/pet/:petId" element={<PetDetail/>} />
          <Route path="/login" element={<Auth/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/add-pet" element={<AddPetPage/>} />
          <Route path="/appointments" element={<Appointments/>} />
          <Route path="/appointments/:id" element={<AppointmentDetail/>} />
          <Route path="/about" element={<About/>} />
          <Route path="/profile" element={<Profile/>} />
        </Routes>
      </main>
    </div>
  )
}
