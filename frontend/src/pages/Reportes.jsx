import React, { useEffect, useState } from 'react'
import { reportesService } from '../services/api'
import { Download, Loader } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const Reportes = () => {
  const [datos, setDatos] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState('mes')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1)
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear())

  useEffect(() => {
    cargarReportes()
  }, [filtro, fecha, mesSeleccionado, anioSeleccionado])

  const cargarReportes = async () => {
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
      setDatos(response.data)
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportar = async () => {
    try {
      await reportesService.exportarExcel()
      alert('Reporte exportado exitosamente')
    } catch (err) {
      alert('Error al exportar')
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>📊 Reportes</h1>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            style={{
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '0.95rem',
              cursor: 'pointer',
              backgroundColor: '#fff'
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
                padding: '0.65rem 1rem',
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
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  backgroundColor: '#fff'
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
                  padding: '0.65rem 1rem',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '0.95rem',
                  width: '100px'
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
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.95rem',
                width: '100px'
              }}
            />
          )}

          <button onClick={exportar} className="btn btn-primary">
            <Download size={20} />
            Exportar Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <Loader size={40} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : datos ? (
        <>
          {/* Gráficas */}
          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>📈 Movimientos por {filtro === 'anio' ? 'Mes' : 'Día'}</h3>
              <div style={{ position: 'relative', height: '300px', width: '100%' }}>
                {(datos.movimientos || []).length > 0 ? (
                  <Bar
                    data={{
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
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'top' } },
                      scales: { y: { beginAtZero: true } }
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#64748b', paddingTop: '5rem' }}>
                    No hay movimientos en este período
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem' }}>📊 Top 10 Productos por Valor</h3>
              <div style={{ height: '300px', overflowY: 'auto' }}>
                {(datos.topProductos || []).length > 0 ? (
                  (datos.topProductos || []).map((p, idx) => (
                    <div key={idx} style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: '500', color: '#1e293b' }}>{p.nombre}</span><br />
                        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Stock: {p.stock_actual} unidades</span>
                      </div>
                      <strong style={{ color: '#4f86f7', fontSize: '1.1rem' }}>${(p.valor || 0).toLocaleString()}</strong>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>
                    No hay productos
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Estado del Inventario */}
          <div className="grid-2">
            <div className="card">
              <h3>📉 Estado del Inventario</h3>
              <div style={{ marginTop: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: '#fee2e2', borderRadius: '8px', marginBottom: '1rem' }}>
                  <p>Productos sin stock: <strong style={{ color: '#991b1b', fontSize: '1.5rem' }}>{datos.sinStock || 0}</strong></p>
                </div>
                <div style={{ padding: '1rem', backgroundColor: '#dcfce7', borderRadius: '8px' }}>
                  <p>Alertas activas: <strong style={{ color: '#15803d', fontSize: '1.5rem' }}>{(datos.alertas || []).length}</strong></p>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>🔔 Últimas Alertas</h3>
              <div style={{ marginTop: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
                {(datos.alertas || []).slice(0, 8).map((a, idx) => (
                  <div key={idx} style={{ padding: '0.75rem', borderBottom: '1px solid #e2e8f0', fontSize: '0.9rem' }}>
                    <div style={{ fontWeight: '600', color: '#1e293b' }}>{a.tipo || 'Alerta'}</div>
                    <div style={{ color: '#64748b' }}>{a.mensaje}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="card">
          <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No hay datos disponibles</p>
        </div>
      )}
    </div>
  )
}

export default Reportes
