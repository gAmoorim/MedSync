import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medsync_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRoute = error.config?.url?.includes('/login')
      if (!isLoginRoute) {
        localStorage.removeItem('medsync_token')
        localStorage.removeItem('medsync_usuario')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
