import axios from 'axios'

// URL del backend en Cloud Run
const API_BASE_URL = 'https://inventario-backend-208277945925.southamerica-east1.run.app'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  }
})

// Interceptor para agregar token a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  obtenerPerfil: () => api.get('/auth/perfil')
}

export const productosService = {
  obtener: (filtros = {}) => api.get('/productos', { params: filtros }),
  obtenerPorId: (id) => api.get(`/productos/${id}`),
  crear: (datos) => api.post('/productos', datos),
  actualizar: (id, datos) => api.put(`/productos/${id}`, datos),
  eliminar: (id) => api.delete(`/productos/${id}`),
  importarExcel: (archivo) => {
    const formData = new FormData()
    formData.append('archivo', archivo)
    return api.post('/productos/importar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
}

export const movimientosService = {
  obtener: () => api.get('/movimientos'),
  registrar: (datos) => api.post('/movimientos/registrar', datos)
}

export const reportesService = {
  obtenerDatos: (filtros = {}) => api.get('/reportes/datos', { params: filtros }),
  exportarExcel: () => api.get('/reportes/exportar-excel')
}

export const prediccionService = {
  calcular: (productoId) => api.get(`/prediccion/calcular?producto_id=${productoId}`),
  analisisGeneral: () => api.get('/prediccion/analisis')
}

export const usuariosService = {
  obtener: () => api.get('/usuarios'),
  crear: (datos) => api.post('/usuarios', datos),
  actualizar: (id, datos) => api.put(`/usuarios/${id}`, datos),
  eliminar: (id) => api.delete(`/usuarios/${id}`)
}

export default api
