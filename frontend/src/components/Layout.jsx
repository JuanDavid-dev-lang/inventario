import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Menu, X, LogOut, LayoutGrid, Package, Move, BarChart3,
  Brain, Users, Home
} from 'lucide-react'

const Layout = () => {
  const { usuario, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/productos', label: 'Productos', icon: Package },
    { path: '/movimientos', label: 'Movimientos', icon: Move },
    { path: '/reportes', label: 'Reportes', icon: BarChart3 },
    { path: '/prediccion', label: 'Predicción IA', icon: Brain }
  ]

  if (usuario?.rol === 'admin') {
    menuItems.push({ path: '/usuarios', label: 'Usuarios', icon: Users })
  }

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await logout()
    window.location.href = '/login'
  }

  return (
    <div className="main-layout">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? '' : 'hidden'}`} style={{ transition: 'all 0.3s ease' }}>
        <div style={{ padding: '2rem 1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#4f86f7', marginBottom: '2rem' }}>
            📦 InventarioPro
          </h1>

          <nav>
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    marginBottom: '0.5rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    color: isActive(item.path) ? '#4f86f7' : '#64748b',
                    backgroundColor: isActive(item.path) ? '#f0f4ff' : 'transparent',
                    fontWeight: isActive(item.path) ? '600' : '500',
                    transition: 'all 0.3s ease',
                    borderLeft: isActive(item.path) ? '4px solid #4f86f7' : '4px solid transparent',
                    borderRadius: '0 8px 8px 0'
                  }}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <hr style={{ margin: '2rem 0', borderColor: '#e2e8f0' }} />

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              width: '100%',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: '#dc2626',
              backgroundColor: '#fee2e2',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#fca5a5'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#fee2e2'}
          >
            <LogOut size={20} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="content">
        {/* Navbar */}
        <div className="navbar">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <h2>InventarioPro v2.0</h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#64748b' }}>👤 {usuario?.nombre}</span>
            <span style={{ fontSize: '0.8rem', padding: '0.25rem 0.75rem', backgroundColor: '#f0f4ff', borderRadius: '20px', color: '#4f86f7' }}>
              {usuario?.rol === 'admin' ? 'Admin' : 'Empleado'}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default Layout
