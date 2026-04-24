import React, { useEffect, useState } from 'react'
import { productosService } from '../services/api'
import { Plus, Search, Download, Upload, Trash2, Edit2, Loader } from 'lucide-react'

const Productos = () => {
  const [productos, setProductos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    precio_compra: '',
    precio_venta: '',
    stock_actual: '',
    stock_minimo: ''
  })

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      setLoading(true)
      const response = await productosService.obtener({ buscar: searchTerm })
      console.log('Productos response:', response)
      
      // Asegurar que siempre sea un array
      const data = Array.isArray(response.data) ? response.data : response.data?.productos || []
      setProductos(data)
    } catch (err) {
      console.error('Error al cargar productos:', err)
      setProductos([])
    } finally {
      setLoading(false)
    }
  }

  const handleCrear = async (e) => {
    e.preventDefault()
    try {
      await productosService.crear(formData)
      setFormData({ codigo: '', nombre: '', precio_compra: '', precio_venta: '', stock_actual: '', stock_minimo: '' })
      setShowForm(false)
      cargarProductos()
    } catch (err) {
      alert('Error al crear producto')
    }
  }

  const handleEliminar = async (id) => {
    if (confirm('¿Eliminar este producto?')) {
      try {
        await productosService.eliminar(id)
        cargarProductos()
      } catch (err) {
        alert('Error al eliminar')
      }
    }
  }

  const handleImportarExcel = async (e) => {
    const archivo = e.target.files[0]
    if (!archivo) return

    try {
      await productosService.importarExcel(archivo)
      alert('Productos importados correctamente')
      cargarProductos()
    } catch (err) {
      alert('Error al importar: ' + err.message)
    }
  }

  const productosFiltrados = (Array.isArray(productos) ? productos : []).filter(p =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>📦 Productos</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <label className="btn btn-ghost">
            <Upload size={20} />
            Importar Excel
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleImportarExcel}
              style={{ display: 'none' }}
            />
          </label>
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn btn-primary"
          >
            <Plus size={20} />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card" style={{ marginBottom: '2rem', backgroundColor: '#f8fafc' }}>
          <h3>Crear Producto</h3>
          <form onSubmit={handleCrear} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1rem' }}>
            <div className="form-group">
              <label>Código</label>
              <input
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Nombre</label>
              <input
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Precio Compra</label>
              <input
                type="number"
                step="0.01"
                value={formData.precio_compra}
                onChange={(e) => setFormData({ ...formData, precio_compra: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Precio Venta</label>
              <input
                type="number"
                step="0.01"
                value={formData.precio_venta}
                onChange={(e) => setFormData({ ...formData, precio_venta: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Stock Actual</label>
              <input
                type="number"
                value={formData.stock_actual}
                onChange={(e) => setFormData({ ...formData, stock_actual: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Stock Mínimo</label>
              <input
                type="number"
                value={formData.stock_minimo}
                onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                required
              />
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

      {/* Búsqueda */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <button onClick={cargarProductos} className="btn btn-primary">
          <Search size={20} />
          Buscar
        </button>
      </div>

      {/* Tabla de productos */}
      <div className="card">
        {loading ? (
          <div className="loading">
            <Loader size={40} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <>
            <h3 style={{ marginBottom: '1rem' }}>
              Total: <strong>{productosFiltrados.length}</strong> productos
            </h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Stock</th>
                  <th>Precio Compra</th>
                  <th>Precio Venta</th>
                  <th>Ganancia</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.codigo}</strong></td>
                    <td>{p.nombre}</td>
                    <td>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        backgroundColor: p.stock_actual <= p.stock_minimo ? '#fee2e2' : '#dcfce7',
                        color: p.stock_actual <= p.stock_minimo ? '#991b1b' : '#15803d'
                      }}>
                        {p.stock_actual} unidades
                      </span>
                    </td>
                    <td>${parseFloat(p.precio_compra).toFixed(2)}</td>
                    <td>${parseFloat(p.precio_venta).toFixed(2)}</td>
                    <td>${(parseFloat(p.precio_venta) - parseFloat(p.precio_compra)).toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => alert('Editar: ' + p.nombre)}
                          style={{ padding: '0.5rem', background: '#e0f2fe', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          <Edit2 size={18} color="#0369a1" />
                        </button>
                        <button
                          onClick={() => handleEliminar(p.id)}
                          style={{ padding: '0.5rem', background: '#fee2e2', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          <Trash2 size={18} color="#dc2626" />
                        </button>
                      </div>
                    </td>
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

export default Productos
