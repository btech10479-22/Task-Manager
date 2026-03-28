import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">

      {/* Left panel - Hero / info */}
      <div className="hidden lg:flex lg:w-1/2 bg-white shadow-md flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2 mb-10">
            {/* <div className="w-10 h-10 bg-blue-500 rounded-md flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
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
            <span className="text-3xl font-bold text-gray-950 title content-center">TeamFlow</span>
          </div>

          <h2 className="text-3xl font-semibold text-gray-700 mb-4">
            Organize work effortlessly
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Track tasks, Collaborate, manage tasks, and achieve goals faster. Built for users and admins.
          </p>


          <ul className="space-y-2 text-gray-600">
            {['Track tasks across your team', 'Clear task visibility', 'Filter by progress & assignee', 'Admin controls built in'].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 mt-1" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-6 p-4 rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition">

          <div className="flex items-center gap-4">

            {/* Image */}
            <img
              src="https://cdn-icons-png.flaticon.com/512/2910/2910791.png"
              alt="task preview"
              className="w-14 h-14"
            />

            {/* Content */}
            <div>
              <h3 className="text-gray-800 font-semibold text-sm">
                Smart Task Management
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Organize, assign and track tasks with real-time updates
              </p>
            </div>

          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

          {/* Card 1 */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=800&auto=format&fit=crop"
              alt="task"
              className="w-full h-32 object-cover"
            />
            <div className="p-3">
              <h3 className="text-gray-800 font-semibold text-sm mb-1">Track Tasks</h3>
              <p className="text-xs text-gray-500">
                Monitor progress across your team easily
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop"
              alt="team"
              className="w-full h-32 object-cover"
            />
            <div className="p-3">
              <h3 className="text-gray-800 font-semibold text-sm mb-1">Visibility</h3>
              <p className="text-xs text-gray-500">
                Get clear insights into task status
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop"
              alt="analytics"
              className="w-full h-32 object-cover"
            />
            <div className="p-3">
              <h3 className="text-gray-800 font-semibold text-sm mb-1">Admin Control</h3>
              <p className="text-xs text-gray-500">
                Manage users and tasks efficiently
              </p>
            </div>
          </div>

        </div>


        <p className="text-xs text-gray-400 mt-10">TEAMFLOW © 2026</p>
      </div>

      {/* Right panel — form */}


      <div className="flex-1 flex items-center justify-center bg-gray-50 px-20 py-50">
        <div className="w-[90%] h-[60%]  max-w-2xl bg-white p-10 rounded-2xl shadow-md">
          {/* <div className="mb-8">
            <h1 className="text-2xl font-semibold text-black mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500">Sign in to your workspace</p>
          </div> */}
          {/* Heading */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800">Welcome back</h1>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to your workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                // className="input"
                placeholder="Enter your email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
            <br />

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                // className="input"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"

              />
            </div>
            {/* Remember + Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="accent-blue-800" />
                Remember me
              </label>
            </div>

            <button type="submit" className="btn-primary w-full mt-2 py-2.5  rounded-lg font-semibold text-white transition" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <br />

          <p className="text text-gray-500 text-center mt-5">
            Not Registered?{' '}
            <br />
            <br />
            <Link to="/register" className="text-blue-600 hover:text-blue-800 transition-colors">
              Sign up here
            </Link>
          </p>
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400"></span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <p className="text-xs text-gray-400 text-center mt-6">
              Trusted by teams to manage tasks efficiently and securely.
            </p>
            <br />
            <div className="text-xs text-gray-400 flex justify-center gap-4 mt-6">
              <span className="hover:underline cursor-pointer">Privacy</span>
              <span className="hover:underline cursor-pointer">Terms</span>
              <span className="hover:underline cursor-pointer">Help</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
