import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('ms_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      const isLogin = err.config?.url?.includes('/login')
      if (!isLogin) {
        localStorage.removeItem('ms_token')
        localStorage.removeItem('ms_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
