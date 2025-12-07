import axios from 'axios'

const apiUrl = import.meta.env.VITE_API_URL || ''

const api = axios.create({
  baseURL: apiUrl,
})

// Attach bearer token automatically when available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pawmate_token')
    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export default api
