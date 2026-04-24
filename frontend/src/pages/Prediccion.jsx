import React, { useEffect, useState } from 'react'
import { prediccionService, productosService } from '../services/api'
import { Brain, Loader, AlertCircle, TrendingUp, Lightbulb } from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const Prediccion = () => {
  const [productos, setProductos] = useState([])
  const [prediccionSeleccionada, setPrediccionSeleccionada] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingPrediccion, setLoadingPrediccion] = useState(false)

  useEffect(() => {
    cargarProductos()
  }, [])

  const cargarProductos = async () => {
    try {
      setLoading(true)
      const response = await productosService.obtener()
      
      // Asegurar que siempre sea un array
      const data = Array.isArray(response.data) ? response.data : response.data?.productos || []
      setProductos(data)
    } catch (err) {
      console.error('Error:', err)
      setProductos([])
    } finally {
      setLoading(false)
    }
  }

  const calcularPrediccion = async (productoId) => {
    try {
      setLoadingPrediccion(true)
      const response = await prediccionService.calcular(productoId)
      setPrediccionSeleccionada(response.data)
    } catch (err) {
      alert('Error al calcular predicción')
    } finally {
      setLoadingPrediccion(false)
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>🤖 Predicción de Demanda con IA</h1>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card">
          <h3>Seleccionar Producto</h3>
          {loading ? (
            <div className="loading"><Loader size={40} /></div>
          ) : (
            <select
              onChange={(e) => calcularPrediccion(e.target.value)}
              style={{ marginTop: '1rem' }}
            >
              <option value="">Elige un producto...</option>
              {(Array.isArray(productos) ? productos : []).map(p => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          )}
        </div>

        {prediccionSeleccionada && (
          <div className="card" style={{ backgroundColor: '#f0f4ff' }}>
            <h3>📊 Predicción Actual</h3>
            <div style={{ marginTop: '1rem' }}>
              <p>Modelo: <strong>{prediccionSeleccionada.modelo_ia}</strong></p>
              <p>Timestamp: <strong>{new Date(prediccionSeleccionada.timestamp).toLocaleString()}</strong></p>
            </div>
          </div>
        )}
      </div>

      {loadingPrediccion ? (
        <div className="loading"><Loader size={40} style={{ animation: 'spin 1s linear infinite' }} /></div>
      ) : prediccionSeleccionada?.prediccion_ia ? (
        <>
          {/* Análisis de Predicción */}
          <div className="grid-2" style={{ marginBottom: '2rem' }}>
            <div className="card">
              <h3>📈 Análisis de Predicción</h3>
              <div style={{ marginTop: '1rem' }}>
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0f4ff', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <TrendingUp size={20} style={{ color: '#4f86f7' }} />
                    <span style={{ fontWeight: '600' }}>Tendencia</span>
                  </div>
                  <p style={{ fontSize: '1.3rem', fontWeight: '700', color: '#4f86f7' }}>
                    {prediccionSeleccionada.prediccion_ia?.tendencia || '→ DATOS INSUFICIENTES'}
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '600', color: '#64748b' }}>Nivel de Riesgo</label>
                  <p style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    backgroundColor: prediccionSeleccionada.prediccion_ia?.nivel_riesgo === 'CRÍTICO' ? '#fee2e2' : prediccionSeleccionada.prediccion_ia?.nivel_riesgo === 'ALTO' ? '#fef3c7' : '#dcfce7',
                    color: prediccionSeleccionada.prediccion_ia?.nivel_riesgo === 'CRÍTICO' ? '#991b1b' : prediccionSeleccionada.prediccion_ia?.nivel_riesgo === 'ALTO' ? '#92400e' : '#15803d',
                    fontWeight: '600'
                  }}>
                    {prediccionSeleccionada.prediccion_ia?.nivel_riesgo || 'DESCONOCIDO'}
                  </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontWeight: '600', color: '#64748b' }}>Recomendación de Compra</label>
                  <p style={{ marginTop: '0.5rem', fontSize: '1.2rem', fontWeight: '700', color: '#1e293b' }}>
                    {prediccionSeleccionada.prediccion_ia?.recomendacion_compra || 0} unidades
                  </p>
                </div>

                <div>
                  <label style={{ fontWeight: '600', color: '#64748b' }}>Confianza del Modelo</label>
                  <div style={{ marginTop: '0.5rem', backgroundColor: '#e2e8f0', borderRadius: '8px', overflow: 'hidden', height: '24px' }}>
                    <div style={{
                      width: `${((prediccionSeleccionada.prediccion_ia?.confianza || 0) * 100)}%`,
                      backgroundColor: '#4f86f7',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      {(((prediccionSeleccionada.prediccion_ia?.confianza || 0) * 100)).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <h3>💡 Análisis Detallado</h3>
              <div style={{ marginTop: '1rem', color: '#64748b', lineHeight: '1.8' }}>
                
                {/* Sección principal de análisis */}
                <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #0284c7' }}>
                  <p style={{ margin: '0', fontSize: '0.95rem' }}>{prediccionSeleccionada.prediccion_ia?.analisis || 'Sin análisis disponible'}</p>
                </div>

                {/* Métricas de demanda */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margins: '0 0 0.75rem 0', color: '#1e293b', fontSize: '0.95rem', fontWeight: '600' }}>📊 Métricas de Demanda</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                      <small style={{ color: '#64748b' }}>Demanda Predicha</small>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#0284c7' }}>
                        {(prediccionSeleccionada.prediccion_ia?.prediccion_demanda || 0).toFixed(1)} ud/día
                      </p>
                    </div>
                    <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                      <small style={{ color: '#64748b' }}>Recomendación Actual</small>
                      <p style={{ margin: '0.25rem 0 0 0', fontSize: '1.1rem', fontWeight: '700', color: '#d97706' }}>
                        {prediccionSeleccionada.prediccion_ia?.recomendacion_compra || 0} unidades
                      </p>
                    </div>
                  </div>
                </div>

                {/* Análisis de cobertura de stock */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margins: '0 0 0.75rem 0', color: '#1e293b', fontSize: '0.95rem', fontWeight: '600' }}>📦 Análisis de Cobertura</h4>
                  <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
                    <small style={{ color: '#64748b' }}>Demanda Proyectada</small>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '1rem', fontWeight: '600', color: '#1e293b' }}>
                      {((prediccionSeleccionada.prediccion_ia?.prediccion_demanda || 0) * 7).toFixed(0)} unidades por semana
                    </p>
                  </div>
                </div>

                {/* Recomendaciones de acción */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <h4 style={{ margins: '0 0 0.75rem 0', color: '#1e293b', fontSize: '0.95rem', fontWeight: '600' }}>⚡ Recomendaciones de Acción</h4>
                  <ul style={{ margin: '0', paddingLeft: '1.25rem', fontSize: '0.9rem' }}>
                    {prediccionSeleccionada.prediccion_ia?.nivel_riesgo === 'CRÍTICO' && (
                      <>
                        <li>🚨 Realizar compra URGENTE de {prediccionSeleccionada.prediccion_ia?.recomendacion_compra} unidades</li>
                        <li>📞 Contactar proveedor para entrega acelerada</li>
                        <li>⚠️ Stock crítico: riesgo de ruptura en 1-2 días</li>
                      </>
                    )}
                    {prediccionSeleccionada.prediccion_ia?.nivel_riesgo === 'ALTO' && (
                      <>
                        <li>⚠️ Programar compra próxima semana (máximo 72h)</li>
                        <li>📊 Monitorear demanda diariamente</li>
                        <li>✅ Stock para {((prediccionSeleccionada.prediccion_ia?.recomendacion_compra || 0) / (prediccionSeleccionada.prediccion_ia?.prediccion_demanda || 1)).toFixed(1)} días</li>
                      </>
                    )}
                    {prediccionSeleccionada.prediccion_ia?.nivel_riesgo === 'NORMAL' && (
                      <>
                        <li>✅ Stock suficiente para las próximas semanas</li>
                        <li>📈 Monitoreo mensual recomendado</li>
                        <li>💡 Oportunidad de optimizar inventario</li>
                      </>
                    )}
                  </ul>
                </div>

                {/* Observaciones adicionales */}
                {prediccionSeleccionada.prediccion_ia?.observaciones && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#fef3c7', borderRadius: '6px', borderLeft: '4px solid #d97706' }}>
                    <strong style={{ color: '#92400e' }}>📝 Observaciones:</strong><br />
                    <small style={{ color: '#b45309' }}>{prediccionSeleccionada.prediccion_ia?.observaciones}</small>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recomendaciones de IA */}
          <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid #d97706', backgroundColor: '#fffbeb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Lightbulb size={24} style={{ color: '#d97706' }} />
              <h3 style={{ margin: 0 }}>✨ Recomendaciones de IA</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', borderLeft: '3px solid #16a34a' }}>
                <h4 style={{ color: '#15803d', marginBottom: '0.5rem' }}>✅ Acción Recomendada</h4>
                <p style={{ color: '#64748b' }}>
                  {prediccionSeleccionada.prediccion_ia.nivel_riesgo === 'CRÍTICO'
                    ? '⚠️ URGENTE: Realizar compra inmediata de ' + prediccionSeleccionada.prediccion_ia.recomendacion_compra + ' unidades'
                    : prediccionSeleccionada.prediccion_ia.nivel_riesgo === 'ALTO'
                    ? '⚠️ IMPORTANTE: Programar compra en corto plazo'
                    : '✅ Stock en buen nivel, monitorear tendencia'}
                </p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', borderLeft: '3px solid #4f86f7' }}>
                <h4 style={{ color: '#1d4ed8', marginBottom: '0.5rem' }}>📊 Tendencia Esperada</h4>
                <p style={{ color: '#64748b' }}>
                  {prediccionSeleccionada.prediccion_ia.tendencia === 'AUMENTANDO'
                    ? '📈 Demanda en aumento - Aumentar niveles de stock'
                    : prediccionSeleccionada.prediccion_ia.tendencia === 'DISMINUYENDO'
                    ? '📉 Demanda en descenso - Ajustar órdenes de compra'
                    : '➡️ Demanda estable - Mantener stock actual'}
                </p>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'white', borderRadius: '8px', borderLeft: '3px solid #d97706' }}>
                <h4 style={{ color: '#b45309', marginBottom: '0.5rem' }}>⏰ Próximo Monitoreo</h4>
                <p style={{ color: '#64748b' }}>
                  Revisar predicción en: <strong>7 días</strong><br />
                  Próxima actualización: <strong>{new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}</strong>
                </p>
              </div>
            </div>
          </div>

          {/* Gráfica de Proyección */}
          <div className="card">
            <h3 style={{ marginBottom: '1rem' }}>📊 Proyección de Demanda (14 días)</h3>
            <div style={{ position: 'relative', height: '350px', width: '100%' }}>
              <Line
                data={{
                  labels: Array.from({ length: 14 }, (_, i) => {
                    const d = new Date(Date.now() + i * 24 * 60 * 60 * 1000)
                    return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
                  }),
                  datasets: [
                    {
                      label: 'Demanda Proyectada',
                      data: Array.from({ length: 14 }, (_, i) => {
                        const base = prediccionSeleccionada.prediccion_ia.recomendacion_compra
                        const trend = prediccionSeleccionada.prediccion_ia.tendencia === 'AUMENTANDO' ? i * 2 : prediccionSeleccionada.prediccion_ia.tendencia === 'DISMINUYENDO' ? -i * 2 : 0
                        return Math.max(0, base + trend + (Math.random() - 0.5) * 10)
                      }),
                      borderColor: '#4f86f7',
                      backgroundColor: 'rgba(79, 134, 247, 0.1)',
                      borderWidth: 2,
                      fill: true,
                      tension: 0.4,
                      pointRadius: 4,
                      pointHoverRadius: 6,
                      pointBackgroundColor: '#4f86f7'
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: false }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: { display: true, text: 'Unidades' }
                    }
                  }
                }}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}

export default Prediccion
