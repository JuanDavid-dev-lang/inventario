import React, { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Menu, X, LogOut, Package, Move, BarChart3,
  Brain, Users, Home, Boxes
} from 'lucide-react'

/**
 * Presentation lives in global.css, not in style props.
 *
 * Every rule here used to be an inline object, which meant a colour could only
 * be changed by editing JSX in several places and none of it could respond to
 * a media query or a :hover without a JS handler. Classes let the whole app be
 * restyled from one file.
 */
const Layout = () => {
  const { usuario, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/productos', label: 'Productos', icon: Package },
    { path: '/movimientos', label: 'Movimientos', icon: Move },
    { path: '/reportes', label: 'Reportes', icon: BarChart3 },
    { path: '/prediccion', label: 'Predicción', icon: Brain }
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
      <aside className={`sidebar ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="brand">
          <span className="brand-mark" aria-hidden="true">
            <Boxes size={16} />
          </span>
          InventarioPro
        </div>

        <nav className="sidebar-nav" aria-label="Secciones">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${active ? 'is-active' : ''}`}
                // Marks the current page for screen readers too, instead of
                // signalling it with colour alone.
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={17} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar-foot">
          <button type="button" className="logout-btn" onClick={handleLogout}>
            <LogOut size={17} aria-hidden="true" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <div className="content">
        <header className="navbar">
          <button
            type="button"
            className="icon-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Ocultar menú' : 'Mostrar menú'}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <X size={17} /> : <Menu size={17} />}
          </button>

          <div className="navbar-user">
            <strong>{usuario?.nombre}</strong>
            <span className="role-chip">
              {usuario?.rol === 'admin' ? 'Admin' : 'Empleado'}
            </span>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
