# API Cambio de Monedas (ITM)

Sistema y API REST de consulta y gestión de divisas internacionales, tasas de cambio históricas y países asociados, migrado a Node.js (Express + TypeScript + React).

## 🚀 Características
- **Catálogo de 177 Monedas ISO 4217** con búsqueda por nombre, sigla y país.
- **Histórico de Tasas de Cambio por Periodo** (`/api/monedas/listarporperiodo`) con visualizaciones gráficas y estadísticas (mínimo, máximo, promedio).
- **Catálogo de 249 Países** con códigos Alfa-2, Alfa-3, vinculación de divisa y consulta de capital (`/api/paises/capital/:pais`).
- **Autenticación JWT HS256**: Generación y validación de tokens de portador (Bearer) con expiración de 30 minutos.
- **Explorador Interactivo de Endpoints (Swagger REST Console)** para pruebas directas en vivo.
- **Conversor de Divisas en Tiempo Real** utilizando las cotizaciones almacenadas.

## 🔑 Credenciales de Acceso Precargadas
| Usuario | Clave | Rol |
|---|---|---|
| `fray` | `123` | Administrador |
| `frayosorio` | `123` | Usuario |

## 🛠️ Endpoints Principales
- **Monedas**:
  - `GET /api/monedas/listar`
  - `GET /api/monedas/obtener/:id`
  - `GET /api/monedas/buscar/:nombre`
  - `GET /api/monedas/buscarporpais/:nombre`
  - `POST /api/monedas/agregar`
  - `PUT /api/monedas/modificar`
  - `DELETE /api/monedas/eliminar/:id`
  - `GET/POST /api/monedas/listarporperiodo?idMoneda=35&desde=2018-01-01&hasta=2018-02-15`
- **Países**:
  - `GET /api/paises/listar`
  - `GET /api/paises/obtener/:id`
  - `GET /api/paises/buscar/:nombre`
  - `GET /api/paises/capital/:pais`
  - `POST /api/paises/agregar`
  - `PUT /api/paises/modificar`
  - `DELETE /api/paises/eliminar/:id`
- **Usuarios & Autenticación**:
  - `GET /api/usuarios/login/:usuario/:clave`
  - `POST /api/usuarios/login`
  - `GET /api/usuarios/listar`
  - `GET /api/usuarios/obtener/:id`
  - `GET /api/usuarios/buscar/:nombre`
  - `POST /api/usuarios/agregar`
  - `PUT /api/usuarios/modificar`
  - `DELETE /api/usuarios/eliminar/:id`

## 💻 Ejecución
- Desarrollo: `npm run dev` (Inicia en `http://0.0.0.0:3000`)
- Compilación: `npm run build`
- Producción: `npm start`
