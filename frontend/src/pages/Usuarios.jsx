import React, { useEffect, useState } from 'react'
import { usuariosService } from '../services/api'
import { Plus, Trash2, Loader } from 'lucide-react'

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'empleado'
  })

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      setLoading(true)
      const response = await usuariosService.obtener()
      
      // Asegurar que siempre sea un array
      const data = Array.isArray(response.data) ? response.data : response.data?.usuarios || []
      setUsuarios(data)
    } catch (err) {
      console.error('Error:', err)
      setUsuarios([])
    } finally {
      setLoading(false)
    }
  }

  const handleCrear = async (e) => {
    e.preventDefault()
    try {
      await usuariosService.crear(formData)
      setFormData({ nombre: '', email: '', password: '', rol: 'empleado' })
      setShowForm(false)
      cargarUsuarios()
    } catch (err) {
      alert('Error al crear usuario')
    }
  }

  const handleEliminar = async (id) => {
    if (confirm('¿Eliminar este usuario?')) {
      try {
        await usuariosService.eliminar(id)
        cargarUsuarios()
      } catch (err) {
        alert('Error al eliminar')
      }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>👥 Gestión de Usuarios</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#f8fafc' }}>
          <h3>Crear Usuario</h3>
          <form onSubmit={handleCrear} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label>Nombre</label>
              <input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Rol</label>
              <select
                value={formData.rol}
                onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
              >
                <option value="empleado">Empleado</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-success">Crear</button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn btn-ghost"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <div className="loading"><Loader size={40} style={{ animation: 'spin 1s linear infinite' }} /></div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(Array.isArray(usuarios) ? usuarios : []).map(u => (
                <tr key={u.id}>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td><strong>{u.rol === 'admin' ? '👨‍💼 Admin' : '👤 Empleado'}</strong></td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      backgroundColor: u.activo ? '#dcfce7' : '#fee2e2',
                      color: u.activo ? '#15803d' : '#991b1b'
                    }}>
                      {u.activo ? '✅ Activo' : '❌ Inactivo'}
                    </span>
                  </td>
                  <td>{new Date(u.creado_en).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleEliminar(u.id)}
                      style={{ padding: '0.5rem', background: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      <Trash2 size={18} color="#dc2626" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Usuarios
