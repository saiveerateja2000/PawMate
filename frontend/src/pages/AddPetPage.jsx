import React from 'react'
import PetForm from '../components/PetForm'

export default function AddPetPage(){
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Pet</h2>
      <PetForm onSuccess={() => window.location.reload()} />
    </div>
  )
}
