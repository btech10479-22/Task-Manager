import { createContext, useContext, useState, useCallback, useRef } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tf_user')) }
    catch { return null }
  })
  const refreshPromise = useRef(null)

  const saveSession = (data) => {
    localStorage.setItem('tf_token', data.token)
    localStorage.setItem('tf_refresh', data.refreshToken)
    localStorage.setItem('tf_user', JSON.stringify({
      id: data.userId, name: data.name, email: data.email, role: data.role,
    }))
    setUser({ id: data.userId, name: data.name, email: data.email, role: data.role })
  }

  const login = useCallback(async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    saveSession(res.data.data)
    return res.data.data
  }, [])

  const register = useCallback(async (name, email, password) => {
    const res = await api.post('/api/auth/register', { name, email, password })
    saveSession(res.data.data)
    return res.data.data
  }, [])

  const logout = useCallback(async () => {
    try { await api.post('/api/auth/logout') } catch { /* ignore */ }
    localStorage.removeItem('tf_token')
    localStorage.removeItem('tf_refresh')
    localStorage.removeItem('tf_user')
    setUser(null)
  }, [])

  const silentRefresh = useCallback(async () => {
    const refreshToken = localStorage.getItem('tf_refresh')
    if (!refreshToken) throw new Error('No refresh token')

    if (!refreshPromise.current) {
      refreshPromise.current = api.post('/api/auth/refresh', { refreshToken })
        .then(res => {
          saveSession(res.data.data)
          return res.data.data.token
        })
        .finally(() => { refreshPromise.current = null })
    }
    return refreshPromise.current
  }, [])

  const isAdmin = user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, register, logout, silentRefresh }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
