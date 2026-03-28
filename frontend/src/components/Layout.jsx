import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NavItem = ({ to, icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 ${
        isActive
          ? 'bg-blue-100 text-blue-600 border border-blue-200'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`
    }
  >
    <span className="text-lg leading-none">{icon}</span>
    {label}
  </NavLink>
)

export default function Layout({ children }) {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
       <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-200">
          <div className="flex items-center gap-2">
            {/* <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
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
            <span className="font-semibold text-gray-800 tracking-tight">TeamFlow</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest px-3 mb-1">Workspace</p>
          <NavItem to="/" icon="⊞" label="Dashboard" />
          {isAdmin && <NavItem to="/admin/users" icon="⊙" label="Users" />}
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-gray-200">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-gray-600 truncate">{user?.name}</p>
            <p className="text-[10px] font-mono text-gray-500 truncate">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500
           hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
          >
            <span>⇤</span> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
