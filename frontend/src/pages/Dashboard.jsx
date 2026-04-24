import React, { useEffect, useState } from 'react'
import { reportesService } from '../services/api'
import { BarChart3, Package, AlertCircle, TrendingUp, Loader } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const Dashboard = () => {
  const [datos, setDatos] = useState({
    kpis: {
      total_productos: 0,
      valor_inventario: 0,
      alertas_sin_leer: 0,
      movimientos_hoy: 0
    },
    alertas: [],
    movimientos: [],
    stock_critico: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('mes')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1)
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear())

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true)
        const params = { tipo_rango: filtro }
        
        if (filtro === '24h') {
          params.fecha = fecha
        } else if (filtro === 'mes') {
          params.mes = mesSeleccionado
          params.anio = anioSeleccionado
        } else if (filtro === 'anio') {
          params.anio = anioSeleccionado
        }
        
        const response = await reportesService.obtenerDatos(params)
        console.log('Dashboard data response:', response)
        
        // Asegurar que tenemos la estructura correcta
        if (response && response.data) {
          setDatos(response.data)
        } else {
          console.error('Invalid response structure:', response)
          setError('Estructura de datos inválida del servidor')
        }
      } catch (err) {
        setError('Error al cargar los datos del dashboard: ' + (err.message || err))
        console.error('Error loading dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    cargarDatos()
  }, [filtro, fecha, mesSeleccionado, anioSeleccionado])

  if (loading) {
    return (
      <div className="loading">
        <Loader size={40} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  return (
    <div>
      {/* Encabezado */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1>📊 Dashboard</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            <option value="24h">Últimas 24h</option>
            <option value="semana">Esta semana</option>
            <option value="mes">Este mes</option>
            <option value="anio">Este año</option>
          </select>

          {filtro === '24h' && (
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.95rem'
              }}
            />
          )}

          {filtro === 'mes' && (
            <>
              <select
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                  <option key={m} value={m}>
                    {new Date(2000, m - 1).toLocaleString('es-ES', { month: 'long' })}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={anioSeleccionado}
                onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
                min="2020"
                max={new Date().getFullYear()}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.95rem',
                  width: '90px'
                }}
              />
            </>
          )}

          {filtro === 'anio' && (
            <input
              type="number"
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
              min="2020"
              max={new Date().getFullYear()}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.95rem',
                width: '90px'
              }}
            />
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div className="kpi-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>Total de Productos</h3>
              <div className="value">{(datos?.kpis?.total_productos || 0).toLocaleString()}</div>
            </div>
            <Package size={40} style={{ opacity: 0.3 }} />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeftColor: '#0ea5e9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>Valor del Inventario</h3>
              <div className="value">${((datos?.kpis?.valor_inventario || 0) / 1000000).toFixed(2)}M</div>
            </div>
            <TrendingUp size={40} style={{ opacity: 0.3, color: '#0ea5e9' }} />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeftColor: '#d97706' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>Alertas sin Leer</h3>
              <div className="value" style={{ color: '#d97706' }}>{datos?.kpis?.alertas_sin_leer || 0}</div>
            </div>
            <AlertCircle size={40} style={{ opacity: 0.3, color: '#d97706' }} />
          </div>
        </div>

        <div className="kpi-card" style={{ borderLeftColor: '#16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3>Movimientos Hoy</h3>
              <div className="value" style={{ color: '#16a34a' }}>{datos?.kpis?.movimientos_hoy || 0}</div>
            </div>
            <BarChart3 size={40} style={{ opacity: 0.3, color: '#16a34a' }} />
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>📈 Movimientos por {filtro === 'anio' ? 'Mes' : 'Día'}</h3>
          <div style={{ position: 'relative', height: '300px', width: '100%' }}>
            {(datos.movimientos || []).length > 0 ? (
              <Bar data={{
                labels: [...new Set((datos.movimientos || []).map(m => m.dia))].sort().map(dia => {
                  if (filtro === 'anio') {
                    // Convertir YYYY-MM a nombre de mes
                    const [year, month] = dia.split('-')
                    return new Date(year, month - 1).toLocaleString('es-ES', { month: 'long' })
                  }
                  return dia
                }),
                datasets: [
                  {
                    label: 'Entradas',
                    data: [...new Set((datos.movimientos || []).map(m => m.dia))].sort().map(dia => {
                      const entradas = (datos.movimientos || []).filter(m => m.tipo === 'entrada' && m.dia === dia)
                      return entradas.reduce((sum, m) => sum + m.total, 0)
                    }),
                    backgroundColor: 'rgba(22, 163, 74, 0.6)',
                    borderColor: 'rgba(22, 163, 74, 1)',
                    borderWidth: 2
                  },
                  {
                    label: 'Salidas',
                    data: [...new Set((datos.movimientos || []).map(m => m.dia))].sort().map(dia => {
                      const salidas = (datos.movimientos || []).filter(m => m.tipo === 'salida' && m.dia === dia)
                      return salidas.reduce((sum, m) => sum + m.total, 0)
                    }),
                    backgroundColor: 'rgba(220, 38, 38, 0.6)',
                    borderColor: 'rgba(220, 38, 38, 1)',
                    borderWidth: 2
                  }
                ]
              }} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' }
                },
                scales: {
                  y: {
                    beginAtZero: true
                  }
                }
              }} />
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', paddingTop: '5rem' }}>
                No hay movimientos en este período
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>⚠️ Stock Crítico</h3>
          {datos.stock_critico?.length > 0 ? (
            <div>
              {datos.stock_critico.slice(0, 5).map((prod, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <span>{prod.nombre}</span>
                  <span style={{ color: '#dc2626', fontWeight: '600' }}>
                    {prod.stock_actual} unidades
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#16a34a', textAlign: 'center', padding: '1rem' }}>
              ✅ No hay productos en stock crítico
            </p>
          )}
        </div>
      </div>

      {/* Últimas Alertas */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>🔔 Últimas Alertas</h3>
        {datos.alertas?.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Mensaje</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {datos.alertas.slice(0, 10).map((alerta, idx) => (
                <tr key={idx}>
                  <td>{alerta.producto}</td>
                  <td>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      backgroundColor: alerta.tipo === 'stock_bajo' ? '#fef3c7' : '#fee2e2',
                      color: alerta.tipo === 'stock_bajo' ? '#92400e' : '#991b1b'
                    }}>
                      {alerta.tipo === 'stock_bajo' ? '⚠️ Stock Bajo' : '❌ Sin Stock'}
                    </span>
                  </td>
                  <td>{alerta.mensaje}</td>
                  <td style={{ fontSize: '0.9rem', color: '#64748b' }}>
                    {new Date(alerta.creado_en).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>
            No hay alertas
          </p>
        )}
      </div>
    </div>
  )
}

export default Dashboard
