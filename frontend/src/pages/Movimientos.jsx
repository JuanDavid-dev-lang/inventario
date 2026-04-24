import React, { useEffect, useState } from 'react'
import { movimientosService, productosService } from '../services/api'
import { Plus, Loader } from 'lucide-react'

const Movimientos = () => {
  const [movimientos, setMovimientos] = useState([])
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    producto_id: '',
    tipo: 'entrada',
    cantidad: '',
    motivo: ''
  })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const [mov, prod] = await Promise.all([
        movimientosService.obtener(),
        productosService.obtener()
      ])
      
      // Asegurar que siempre sean arrays
      const movData = Array.isArray(mov.data) ? mov.data : mov.data?.movimientos || []
      const prodData = Array.isArray(prod.data) ? prod.data : prod.data?.productos || []
      
      setMovimientos(movData)
      setProductos(prodData)
    } catch (err) {
      console.error('Error:', err)
      setMovimientos([])
      setProductos([])
    } finally {
      setLoading(false)
    }
  }

  const handleRegistrar = async (e) => {
    e.preventDefault()
    try {
      await movimientosService.registrar(formData)
      setFormData({ producto_id: '', tipo: 'entrada', cantidad: '', motivo: '' })
      setShowForm(false)
      cargarDatos()
    } catch (err) {
      alert('Error al registrar movimiento')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>📊 Movimientos de Inventario</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
        >
          <Plus size={20} />
          Registrar Movimiento
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#f8fafc' }}>
          <h3>Nuevo Movimiento</h3>
          <form onSubmit={handleRegistrar} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label>Producto</label>
              <select
                value={formData.producto_id}
                onChange={(e) => setFormData({ ...formData, producto_id: e.target.value })}
                required
              >
                <option value="">Seleccione un producto</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tipo de Movimiento</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              >
                <option value="entrada">Entrada</option>
                <option value="salida">Salida</option>
                <option value="ajuste">Ajuste</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cantidad</label>
              <input
                type="number"
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Motivo</label>
              <input
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                placeholder="Razón del movimiento"
              />
            </div>
            <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem' }}>
              <button type="submit" className="btn btn-success">Registrar</button>
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

      {/* Tabla de movimientos */}
      <div className="card">
        {loading ? (
          <div className="loading">
            <Loader size={40} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            <h3 style={{ marginBottom: '1rem' }}>
              Total movimientos: <strong>{movimientos.length}</strong>
            </h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Tipo</th>
                  <th>Cantidad</th>
                  <th>Stock Antes</th>
                  <th>Stock Después</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(movimientos) ? movimientos : []).map(m => (
                  <tr key={m.id}>
                    <td>{m.producto}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        backgroundColor: m.tipo === 'entrada' ? '#dcfce7' : m.tipo === 'salida' ? '#fee2e2' : '#fef3c7',
                        color: m.tipo === 'entrada' ? '#15803d' : m.tipo === 'salida' ? '#991b1b' : '#92400e'
                      }}>
                        {m.tipo === 'entrada' ? '📥' : m.tipo === 'salida' ? '📤' : '🔄'} {m.tipo}
                      </span>
                    </td>
                    <td>{m.cantidad}</td>
                    <td>{m.stock_antes}</td>
                    <td>{m.stock_despues}</td>
                    <td>{m.usuario}</td>
                    <td>{new Date(m.fecha).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  )
}

export default Movimientos
