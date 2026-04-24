import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const navigate = useNavigate()
  const { login, error: authError } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      {/* Left side - Branding */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>
            📦 InventarioPro
          </h1>
          <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
            Sistema de Gestión de Inventario
          </p>
          <p style={{ fontSize: '1rem', opacity: 0.7, marginTop: '0.5rem' }}>
            Predicción con IA | Reportes Avanzados
          </p>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'white',
        padding: '2rem'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '1.75rem' }}>
            Iniciar Sesión
          </h2>

          {(error || authError) && (
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              marginBottom: '1.5rem',
              border: '1px solid #fca5a5'
            }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span>{error || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="usuario@ejemplo.com"
                required
                disabled={loading}
              />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Ingrese su contraseña"
                  required
                  disabled={loading}
                  style={{ paddingRight: '3rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                justifyContent: 'center',
                fontWeight: '600',
                padding: '0.75rem',
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? '🔄 Iniciando...' : '🔓 Iniciar Sesión'}
            </button>
          </form>

          <hr style={{ margin: '2rem 0', borderColor: '#e2e8f0' }} />

          <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            Demo: <strong>admin@ejemplo.com</strong> / <strong>password123</strong>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
