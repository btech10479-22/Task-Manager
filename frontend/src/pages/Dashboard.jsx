import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import TaskModal from '../components/TaskModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'

const STATUSES = ['', 'TODO', 'IN_PROGRESS', 'DONE']
const STATUS_LABELS = { '': 'All', TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }
const PAGE_SIZE = 20

function Avatar({ name }) {
  const initials = name?.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div className="w-6 h-6 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center text-[10px] font-mono text-blue-600 shrink-0">
      {initials}
    </div>
  )
}

function TaskRow({ task, onEdit, onDelete, isAdmin }) {
  const { user } = useAuth()
  const canEdit = isAdmin || task.createdBy?.id === user?.id || task.assignedTo?.id === user?.id

  return (
    <div className="flex items-center gap-4 px-5 py-3.5 border-b border-gray-200 hover:bg-gray-50 transition-colors group animate-fade-in">
      <div className="w-28 shrink-0">
        <StatusBadge status={task.status} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{task.title}</p>
        {task.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{task.description}</p>
        )}
      </div>
      <div className="w-36 shrink-0 hidden md:flex items-center gap-2">
        {task.assignedTo ? (
          <>
            <Avatar name={task.assignedTo.name} />
            <span className="text-xs text-gray-600 truncate">{task.assignedTo.name}</span>
          </>
        ) : (
          <span className="text-xs text-gray-500 font-mono">—</span>
        )}
      </div>
      <div className="w-32 shrink-0 hidden lg:block">
        <span className="text-xs text-gray-500 truncate block">{task.createdBy?.name}</span>
      </div>
      <div className="w-24 shrink-0 hidden xl:block">
        <span className="text-xs font-mono text-gray-500">
          {new Date(task.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
        </span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {canEdit && (
          <button onClick={() => onEdit(task)}
            className="text-xs text-gray-400 hover:text-gray-200 px-2 py-1 rounded hover:bg-gray-300 transition-colors">
            Edit
          </button>
        )}
        {isAdmin && (
          <button onClick={() => onDelete(task)}
            className="text-xs text-red-500 hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10 transition-colors">
            Delete
          </button>
        )}
      </div>
    </div>
  )
}

function Pagination({ page, totalPages, totalElements, size, onPage }) {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200">
      <p className="text-xs font-mono text-gray-600">
        {page * size + 1}–{Math.min((page + 1) * size, totalElements)} of {totalElements}
      </p>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => onPage(page - 1)}
          className="text-xs px-2 py-1 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Prev
        </button>
        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
          const p = totalPages <= 7 ? i : Math.max(0, Math.min(page - 3, totalPages - 7)) + i
          return (
            <button
              key={p}
              onClick={() => onPage(p)}
              className={`text-xs w-7 h-7 rounded font-mono transition-colors ${
                p === page
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {p + 1}
            </button>
          )
        })}
        <button
          disabled={page >= totalPages - 1}
          onClick={() => onPage(page + 1)}
          className="text-xs px-2 py-1 rounded text-gray-400 hover:text-gray-200 hover:bg-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { isAdmin } = useAuth()
  const [tasks, setTasks] = useState([])
  const [pagination, setPagination] = useState({ page: 0, totalPages: 0, totalElements: 0 })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [currentPage, setCurrentPage] = useState(0)

  // Modals
  const [editTask, setEditTask] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [deleteTask, setDeleteTask] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = { page: currentPage, size: PAGE_SIZE, sortBy: 'createdAt', direction: 'desc' }
      if (statusFilter) params.status = statusFilter
      if (assigneeFilter) params.assignedTo = assigneeFilter
      if (search) params.search = search
      const res = await api.get('/api/tasks', { params })
      const paged = res.data.data
      setTasks(paged.content)
      setPagination({ page: paged.page, totalPages: paged.totalPages, totalElements: paged.totalElements })
    } catch {
      setError('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, assigneeFilter, search, currentPage])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  useEffect(() => {
    if (isAdmin) api.get('/api/users').then(r => setUsers(r.data.data)).catch(() => {})
  }, [isAdmin])

  // Reset to page 0 when filters change
  useEffect(() => { setCurrentPage(0) }, [statusFilter, assigneeFilter, search])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  const handleSaved = () => {
    setShowCreate(false)
    setEditTask(null)
    fetchTasks()
  }

  const handleDelete = async () => {
    if (!deleteTask) return
    setDeleting(true)
    try {
      await api.delete(`/api/tasks/${deleteTask.id}`)
      setDeleteTask(null)
      fetchTasks()
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const clearFilters = () => {
    setStatusFilter('')
    setAssigneeFilter('')
    setSearch('')
    setSearchInput('')
  }

  const hasFilters = statusFilter || assigneeFilter || search

  // Stats from current visible data (approximate — full count in pagination)
  const counts = tasks.reduce((acc, t) => { acc[t.status] = (acc[t.status] || 0) + 1; return acc }, {})

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Tasks</h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {pagination.totalElements} total tasks
            </p>
          </div>
          <button className="btn-primary flex items-center gap-2" onClick={() => setShowCreate(true)}>
            <span className="text-lg leading-none">+</span> New task
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { key: 'TODO',        label: 'To Do',       color: 'text-slate-400'   },
            { key: 'IN_PROGRESS', label: 'In Progress', color: 'text-blue-400'    },
            { key: 'DONE',        label: 'Done',        color: 'text-emerald-400' },
          ].map(({ key, label, color }) => (
            <div key={key} className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm">
              <p className={`text-2xl font-semibold font-mono ${color}`}>{counts[key] ?? 0}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          {/* Status tabs */}
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm flex items-center gap-2">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors duration-150 ${
                  statusFilter === s
                    ? 'bg-surface-3 text-slate-200 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>

          {/* Assignee filter — admin only */}
          {isAdmin && users.length > 0 && (
            <select
              className="input w-auto text-sm"
              value={assigneeFilter}
              onChange={e => setAssigneeFilter(e.target.value)}
            >
              <option value="">All assignees</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}

          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 ml-auto">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">⌕</span>
              <input
                className="input pl-8 w-52 text-sm"
                placeholder="Search tasks…"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-ghost text-sm px-3 py-2">Search</button>
            {search && (
              <button type="button" onClick={() => { setSearch(''); setSearchInput('') }}
                className="text-xs text-gray-500 hover:text-gray-300">× Clear</button>
            )}
          </form>

          {/* Clear all filters */}
          {hasFilters && !search && (
            <button onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Clear filters ×
            </button>
          )}
        </div>

        {/* Active search badge */}
        {search && (
          <div className="mb-3 flex items-center gap-2">
            <span className="text-xs text-gray-500">Results for</span>
            <span className="text-xs bg-blue-500/15 text-blue-500 border border-blue-500/30 rounded-md px-2 py-0.5 font-mono">
              "{search}"
            </span>
            <button onClick={() => { setSearch(''); setSearchInput('') }}
              className="text-xs text-gray-600 hover:text-gray-400">× clear</button>
          </div>
        )}

        {/* Task table */}
        <div className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm">
          {/* Table header */}
          <div className="flex items-center gap-4 px-5 py-2.5 bg-white border-b border-border bg-surface-2/50">
            <div className="w-28 shrink-0 text-[10px] font-mono text-gray-600 uppercase tracking-widest">Status</div>
            <div className="flex-1 text-[10px] font-mono text-gray-600 uppercase tracking-widest">Title</div>
            <div className="w-36 shrink-0 hidden md:block text-[10px] font-mono text-gray-800 uppercase tracking-widest">Assignee</div>
            <div className="w-32 shrink-0 hidden lg:block text-[10px] font-mono text-gray-600 uppercase tracking-widest">Created by</div>
            <div className="w-24 shrink-0 hidden xl:block text-[10px] font-mono text-gray-600 uppercase tracking-widest">Date</div>
            <div className="w-20 shrink-0" />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-600 text-sm">
              <span className="animate-pulse">Loading…</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16 text-red-400 text-sm">{error}</div>
          ) : tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2">
              <p className="text-gray-500 text-sm">
                {hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
              </p>
              {hasFilters
                ? <button className="text-blue-500 text-sm hover:underline" onClick={clearFilters}>Clear filters</button>
                : <button className="text-blue-500 text-sm hover:underline" onClick={() => setShowCreate(true)}>Create your first task →</button>
              }
            </div>
          ) : (
            tasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                isAdmin={isAdmin}
                onEdit={setEditTask}
                onDelete={setDeleteTask}
              />
            ))
          )}

          {/* Pagination */}
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalElements={pagination.totalElements}
            size={PAGE_SIZE}
            onPage={setCurrentPage}
          />
        </div>
      </div>

      {showCreate && <TaskModal onClose={() => setShowCreate(false)} onSaved={handleSaved} />}
      {editTask   && <TaskModal task={editTask} onClose={() => setEditTask(null)} onSaved={handleSaved} />}
      {deleteTask && (
        <DeleteConfirmModal
          task={deleteTask}
          onClose={() => setDeleteTask(null)}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </Layout>
  )
}
