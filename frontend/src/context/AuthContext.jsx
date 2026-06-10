import React, { createContext, useState, useEffect } from 'react'
import { authService } from '../services/api'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const verificarSesion = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const usuarioGuardado = localStorage.getItem('usuario')
        
        if (token && usuarioGuardado && usuarioGuardado !== 'undefined') {
          // Si hay token y usuario guardado válido, usar eso
          try {
            setUsuario(JSON.parse(usuarioGuardado))
          } catch (e) {
            console.error('Error parseando usuario guardado:', e)
            localStorage.removeItem('adminToken')
            localStorage.removeItem('usuario')
          }
        } else if (!usuarioGuardado || usuarioGuardado === 'undefined') {
          // Limpiar localStorage de valores inválidos
          localStorage.removeItem('usuario')
        }
      } catch (err) {
        console.error('Error verificando sesión:', err)
      } finally {
        setLoading(false)
      }
    }

    verificarSesion()
  }, [])

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await authService.login(email, password)
      const usuario = response.data.usuario || response.data.user

      if (!response.data.token || !usuario) {
        throw new Error('Respuesta de login incompleta')
      }

      localStorage.setItem('adminToken', response.data.token)
      localStorage.setItem('usuario', JSON.stringify(usuario))
      setUsuario(usuario)
      return { ...response.data, usuario }
    } catch (err) {
      const mensaje = err.response?.data?.error || 'Error al iniciar sesión'
      setError(mensaje)
      throw err
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Error al cerrar sesión:', err)
    } finally {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('usuario')
      setUsuario(null)
    }
  }

  return (
    <AuthContext.Provider value={{ usuario, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }
  return context
}
