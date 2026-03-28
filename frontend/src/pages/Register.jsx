import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})
    try {
      await register(form.name, form.email, form.password)
      navigate('/')
    } catch (err) {
      const data = err.response?.data
      if (data?.fieldErrors) setFieldErrors(data.fieldErrors)
      else setError(data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="w-full sm:w-[90%] md:w-[70%] lg:w-[50%] max-w-xl bg-white rounded-2xl shadow-md p-8 flex flex-col justify-between h-[70%]">
        <div className="flex items-center gap-2 mb-8">
          {/* <div className="w-8 h-8 bg-accent rounded-md flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2" width="12" height="2" rx="1" fill="white"/>
              <rect x="1" y="6" width="8" height="2" rx="1" fill="white" opacity="0.7"/>
              <rect x="1" y="10" width="10" height="2" rx="1" fill="white" opacity="0.45"/>
            </svg>
          </div> */}
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-800 text-lg">TeamFlow</span>
        </div>

        {/* <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">Create account</h1>
          <p className="text-sm text-gray-500">
            The first account registered becomes Admin.
          </p>
        </div> */}
        {/* Heading */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-1">
            Create account
          </h1>
          <p className="text-sm text-gray-500">
            The first account registered becomes Admin.
          </p>
        </div>


        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <div>
            <label className="label">Full name</label>
            <input
              className={`input bg-white border-gray-300 text-gray-800 
             placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 
               ${fieldErrors.name ? 'border-red-500' : ''}`}
              placeholder="Enter your full name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              required
            />
            {fieldErrors.name && <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              className={`input bg-white border-gray-300 text-gray-800 
               placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 
               ${fieldErrors.email ? 'border-red-500' : ''}`}
              placeholder="Enter your email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              required

            />
            {fieldErrors.email && <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className={`input bg-white border-gray-300 text-gray-800 
               placeholder-gray-400 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 
               ${fieldErrors.password ? 'border-red-500' : ''}`}
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              required
            />
            {fieldErrors.password && <p className="text-xs text-red-400 mt-1">{fieldErrors.password}</p>}
          </div>

          <button type="submit" className="btn-primary w-full mt-2 py-2.5" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-slate-600 text-center mt-6">
          Already have an account?{' '}
          <br></br>
          <br></br>
          <Link to="/login" className="text-accent hover:text-blue-400 transition-colors">
            Sign in
          </Link>
        </p>
        <br></br>
        <hr></hr>
         <p className="text-xs text-gray-400 text-center mt-6">
              Trusted by teams to manage tasks efficiently and securely.
            </p>
            <div className="text-xs text-gray-400 flex justify-center gap-4 mt-6">
              <span className="hover:underline cursor-pointer">Privacy</span>
              <span className="hover:underline cursor-pointer">Terms</span>
              <span className="hover:underline cursor-pointer">Help</span>
            </div>
      </div>
      
    </div>
  )
}
