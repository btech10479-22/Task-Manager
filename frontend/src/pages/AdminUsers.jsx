import { useState, useEffect } from 'react'
import api from '../api/axios'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'

const ROLE_BADGE = {
  ADMIN: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  USER:  'bg-slate-700/50 text-slate-400 border-slate-600/50',
}

function UserRow({ u, onToggle, acting }) {
  const { user: me } = useAuth()
  const isSelf = u.id === me?.id

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-border/60 hover:bg-surface-2/40 transition-colors group animate-fade-in">
      {/* Avatar + name */}
      <div className="flex items-center gap-3 w-56 shrink-0">
        <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-xs font-mono text-accent">
          {u.name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">
            {u.name} {isSelf && <span className="text-[10px] text-slate-600 font-mono">(you)</span>}
          </p>
          <p className="text-xs text-slate-500 truncate">{u.email}</p>
        </div>
      </div>

      {/* Role */}
      <div className="w-24 shrink-0">
        <span className={`text-xs font-mono border rounded-md px-2 py-0.5 ${ROLE_BADGE[u.role]}`}>
          {u.role}
        </span>
      </div>

      {/* Status */}
      <div className="w-24 shrink-0">
        <span className={`text-xs font-mono border rounded-md px-2 py-0.5 ${
          u.isActive
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            : 'bg-red-500/10 text-red-400 border-red-500/30'
        }`}>
          {u.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Joined */}
      <div className="flex-1 hidden lg:block">
        <span className="text-xs font-mono text-slate-600">
          {new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Action */}
      {!isSelf && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            disabled={acting === u.id}
            onClick={() => onToggle(u)}
            className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-colors ${
              u.isActive
                ? 'text-red-400 border-red-500/30 hover:bg-red-500/10'
                : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
            } disabled:opacity-40`}
          >
            {acting === u.id ? '…' : u.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [acting, setActing] = useState(null) // id of user being toggled

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await api.get('/api/users')
      setUsers(res.data.data)
    } catch {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [])

  const handleToggle = async (u) => {
    setActing(u.id)
    try {
      const endpoint = u.isActive ? 'deactivate' : 'activate'
      await api.patch(`/api/users/${u.id}/${endpoint}`)
      fetchUsers()
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed')
    } finally {
      setActing(null)
    }
  }

  const active = users.filter(u => u.isActive).length

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-100">Users</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">
            {active} active · {users.length - active} inactive
          </p>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-4 px-5 py-2.5 border-b border-border bg-surface-2/50">
            <div className="w-56 shrink-0 text-[10px] font-mono text-slate-600 uppercase tracking-widest">User</div>
            <div className="w-24 shrink-0 text-[10px] font-mono text-slate-600 uppercase tracking-widest">Role</div>
            <div className="w-24 shrink-0 text-[10px] font-mono text-slate-600 uppercase tracking-widest">Status</div>
            <div className="flex-1 hidden lg:block text-[10px] font-mono text-slate-600 uppercase tracking-widest">Joined</div>
            <div className="w-24 shrink-0" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-600 text-sm">Loading…</div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-red-400 text-sm">{error}</div>
          ) : users.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-slate-600 text-sm">No users found</div>
          ) : (
            users.map(u => (
              <UserRow key={u.id} u={u} onToggle={handleToggle} acting={acting} />
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
