import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tf_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config

    const isAuthEndpoint = original.url?.includes('/api/auth/')
    if (err.response?.status !== 401 || isAuthEndpoint || original._retry) {
      return Promise.reject(err)
    }

    const refreshToken = localStorage.getItem('tf_refresh')
    if (!refreshToken) {
      localStorage.clear()
      window.location.href = '/login'
      return Promise.reject(err)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then(token => {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/api/auth/refresh`,
        { refreshToken }
      )
      const { token, refreshToken: newRefreshToken } = res.data.data
      localStorage.setItem('tf_token', token)
      localStorage.setItem('tf_refresh', newRefreshToken)

      api.defaults.headers.common.Authorization = `Bearer ${token}`
      original.headers.Authorization = `Bearer ${token}`
      processQueue(null, token)
      return api(original)
    } catch (refreshErr) {
      processQueue(refreshErr, null)
      localStorage.clear()
      window.location.href = '/login'
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  }
)

export default api
