# Backend API - Sistema de Ventas LENNIN S.A.C

API RESTful construida con Node.js, Express y MongoDB para el sistema de ventas de la juguetería LENNIN S.A.C.

## 🚀 Tecnologías

- **Node.js** v18+ - Entorno de ejecución JavaScript
- **Express** v4.18 - Framework web minimalista
- **MongoDB** - Base de datos NoSQL
- **Mongoose** v8.0 - ODM para MongoDB
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Encriptación de contraseñas

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- MongoDB local o cuenta en MongoDB Atlas
- npm o yarn

## 🔧 Instalación

1. **Instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**

Copia el archivo `.env.example` a `.env` y configura tus variables:

```bash
cp .env.example .env
```

Edita `.env` con tus valores:

```env
# Servidor
NODE_ENV=development
PORT=5000

# Base de datos MongoDB
MONGODB_URI=mongodb://localhost:27017/lennin_ventas
# O para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/lennin_ventas

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_aqui
JWT_EXPIRE=30d

# CORS
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100
```

3. **Iniciar servidor:**

Modo desarrollo (con nodemon):
```bash
npm run dev
```

Modo producción:
```bash
npm start
```

## 📚 Endpoints de la API

### Autenticación

#### POST `/api/auth/register`
Registrar nuevo usuario (solo Admin)

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "password123",
  "role": "vendedor"
}
```

#### POST `/api/auth/login`
Iniciar sesión

**Body:**
```json
{
  "email": "admin@lennin.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Admin",
    "email": "admin@lennin.com",
    "role": "admin",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### GET `/api/auth/me`
Obtener perfil del usuario autenticado

**Headers:**
```
Authorization: Bearer <token>
```

#### PUT `/api/auth/updateprofile`
Actualizar perfil del usuario

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "name": "Juan Pérez",
  "email": "juan.perez@example.com"
}
```

#### PUT `/api/auth/updatepassword`
Cambiar contraseña

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword456"
}
```

---

### Categorías

Todas las rutas requieren autenticación (`Bearer token`)

#### GET `/api/categorias`
Listar categorías con paginación

**Query params:**
- `estado` - Filtrar por estado (true/false)
- `search` - Buscar por nombre o descripción
- `page` - Número de página (default: 1)
- `limit` - Items por página (default: 10)

**Ejemplo:** `/api/categorias?estado=true&search=muñecas&page=1&limit=10`

#### GET `/api/categorias/:id`
Obtener categoría por ID

#### POST `/api/categorias` (Admin)
Crear nueva categoría

**Body:**
```json
{
  "nombre": "Muñecas",
  "descripcion": "Muñecas de todos los tipos",
  "estado": true
}
```

#### PUT `/api/categorias/:id` (Admin)
Actualizar categoría

#### DELETE `/api/categorias/:id` (Admin)
Eliminar categoría

---

### Productos

Todas las rutas requieren autenticación

#### GET `/api/productos`
Listar productos con paginación y filtros

**Query params:**
- `categoria` - ID de categoría
- `estado` - true/false
- `stock_bajo` - true/false (productos con stock <= stock_minimo)
- `search` - Buscar por código, nombre o descripción
- `page` - Número de página
- `limit` - Items por página

#### GET `/api/productos/:id`
Obtener producto por ID

#### POST `/api/productos` (Admin)
Crear nuevo producto

**Body:**
```json
{
  "categoria": "65a1b2c3d4e5f6g7h8i9j0k1",
  "codigo": "TOY001",
  "nombre": "Muñeca Barbie",
  "descripcion": "Muñeca Barbie coleccionable",
  "precio_compra": 25.00,
  "precio_venta": 35.00,
  "stock": 50,
  "stock_minimo": 10,
  "imagen": "https://example.com/barbie.jpg",
  "estado": true
}
```

#### PUT `/api/productos/:id` (Admin)
Actualizar producto

#### DELETE `/api/productos/:id` (Admin)
Eliminar producto

#### PATCH `/api/productos/:id/stock`
Actualizar stock del producto

**Body:**
```json
{
  "cantidad": 10,
  "operacion": "sumar"
}
```

Operaciones: `"sumar"` o `"restar"`

---

### Clientes

Todas las rutas requieren autenticación

#### GET `/api/clientes`
Listar clientes

**Query params:**
- `tipo_documento` - DNI, RUC, CE, PASAPORTE
- `estado` - true/false
- `search` - Buscar por documento, nombres, apellidos o email
- `page` - Número de página
- `limit` - Items por página

#### GET `/api/clientes/:id`
Obtener cliente por ID

#### GET `/api/clientes/buscar/:documento`
Buscar cliente por número de documento

**Ejemplo:** `/api/clientes/buscar/12345678`

#### POST `/api/clientes`
Crear nuevo cliente

**Body:**
```json
{
  "tipo_documento": "DNI",
  "numero_documento": "12345678",
  "nombres": "Carlos",
  "apellidos": "García López",
  "telefono": "987654321",
  "email": "carlos@example.com",
  "direccion": "Av. Principal 123",
  "estado": true
}
```

#### PUT `/api/clientes/:id`
Actualizar cliente

#### DELETE `/api/clientes/:id` (Admin)
Eliminar cliente

---

### Ventas

Todas las rutas requieren autenticación

#### GET `/api/ventas`
Listar ventas con filtros

**Query params:**
- `fecha_inicio` - Fecha inicio (YYYY-MM-DD)
- `fecha_fin` - Fecha fin (YYYY-MM-DD)
- `cliente` - ID del cliente
- `usuario` - ID del usuario
- `metodo_pago` - efectivo, tarjeta, yape, plin, transferencia
- `estado` - pendiente, completada, anulada
- `page` - Número de página
- `limit` - Items por página

**Ejemplo:** `/api/ventas?fecha_inicio=2025-01-01&metodo_pago=efectivo&estado=completada`

#### GET `/api/ventas/:id`
Obtener venta por ID

#### GET `/api/ventas/numero/:numero`
Obtener venta por número de venta

**Ejemplo:** `/api/ventas/numero/V20251210000001`

#### POST `/api/ventas`
Crear nueva venta

**Body:**
```json
{
  "cliente": "65a1b2c3d4e5f6g7h8i9j0k1",
  "items": [
    {
      "producto": "65a1b2c3d4e5f6g7h8i9j0k2",
      "cantidad": 2,
      "precio_unitario": 35.00,
      "descuento": 0
    },
    {
      "producto": "65a1b2c3d4e5f6g7h8i9j0k3",
      "cantidad": 1,
      "precio_unitario": 50.00,
      "descuento": 5.00
    }
  ],
  "metodo_pago": "efectivo",
  "observaciones": "Cliente prefiere empaque especial"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "numero_venta": "V20251210000001",
    "cliente": { ... },
    "usuario": { ... },
    "fecha_venta": "2025-12-10T14:30:00.000Z",
    "items": [ ... ],
    "subtotal": 115.00,
    "igv": 20.70,
    "total": 135.70,
    "metodo_pago": "efectivo",
    "estado": "completada"
  }
}
```

**Nota:** La venta calcula automáticamente:
- Subtotales por item
- IGV (18%)
- Total
- Reduce el stock de productos
- Genera número de venta único

#### PUT `/api/ventas/:id/anular` (Admin)
Anular una venta

**Nota:** Devuelve el stock de los productos automáticamente

#### GET `/api/ventas/stats/dashboard`
Obtener estadísticas del dashboard

**Response:**
```json
{
  "success": true,
  "data": {
    "hoy": {
      "total": 1250.50,
      "cantidad": 15
    },
    "mes": {
      "total": 28340.75,
      "cantidad": 342
    },
    "anio": {
      "total": 156789.25,
      "cantidad": 2154
    },
    "topProductos": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "nombre": "Muñeca Barbie",
        "cantidad": 125,
        "total": 4375.00
      }
    ]
  }
}
```

---

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. Después de iniciar sesión, incluye el token en el header de todas las peticiones:

```
Authorization: Bearer <tu_token_aqui>
```

### Roles de Usuario

- **admin**: Acceso completo a todas las funcionalidades
- **vendedor**: Puede crear ventas, ver y crear clientes, ver productos y categorías

## 🎯 Estructura del Proyecto

```
backend/
├── server.js                 # Punto de entrada de la aplicación
├── package.json              # Dependencias y scripts
├── .env                      # Variables de entorno (no commiteado)
├── .env.example              # Plantilla de variables de entorno
├── .gitignore                # Archivos a ignorar por Git
└── src/
    ├── config/
    │   └── database.js       # Configuración de MongoDB
    ├── models/
    │   ├── User.js           # Modelo de Usuario
    │   ├── Categoria.js      # Modelo de Categoría
    │   ├── Producto.js       # Modelo de Producto
    │   ├── Cliente.js        # Modelo de Cliente
    │   └── Venta.js          # Modelo de Venta
    ├── controllers/
    │   ├── authController.js      # Lógica de autenticación
    │   ├── categoriaController.js # Lógica de categorías
    │   ├── productoController.js  # Lógica de productos
    │   ├── clienteController.js   # Lógica de clientes
    │   └── ventaController.js     # Lógica de ventas
    ├── routes/
    │   ├── auth.js           # Rutas de autenticación
    │   ├── categorias.js     # Rutas de categorías
    │   ├── productos.js      # Rutas de productos
    │   ├── clientes.js       # Rutas de clientes
    │   └── ventas.js         # Rutas de ventas
    └── middleware/
        ├── auth.js           # Middleware de autenticación
        └── errorHandler.js   # Manejo de errores
```

## 🛠️ Características

- ✅ Autenticación JWT con roles (Admin/Vendedor)
- ✅ CRUD completo para Categorías, Productos, Clientes y Ventas
- ✅ Gestión automática de stock
- ✅ Cálculo automático de IGV (18%)
- ✅ Generación automática de números de venta
- ✅ Sistema de anulación de ventas con devolución de stock
- ✅ Búsqueda y filtros avanzados
- ✅ Paginación en todas las listas
- ✅ Estadísticas del dashboard en tiempo real
- ✅ Validación de datos con Mongoose
- ✅ Manejo de errores centralizado
- ✅ Seguridad con Helmet
- ✅ Compresión de respuestas
- ✅ CORS configurado
- ✅ Logging con Morgan

## 🔄 Scripts Disponibles

```bash
# Iniciar servidor en modo desarrollo (con nodemon)
npm run dev

# Iniciar servidor en modo producción
npm start
```

## 📝 Notas Importantes

1. **Primer Usuario Admin**: Para crear el primer usuario administrador, necesitarás hacerlo directamente en la base de datos o temporalmente quitar el middleware de autorización de la ruta de registro.

2. **Stock**: Cada vez que se crea una venta, el stock se reduce automáticamente. Si se anula una venta, el stock se devuelve.

3. **Números de Venta**: Se generan automáticamente con el formato `VYYYYMMDDNNNNNN` (ej: V20251210000001)

4. **IGV**: El sistema calcula automáticamente el 18% de IGV sobre el subtotal.

5. **MongoDB Atlas**: Si usas MongoDB Atlas, asegúrate de:
   - Permitir acceso desde tu IP o desde cualquier IP (0.0.0.0/0)
   - Crear un usuario de base de datos
   - Usar la cadena de conexión correcta

## 🚀 Despliegue en Render

Ver archivo `RENDER_DEPLOYMENT.md` en la raíz del proyecto para instrucciones detalladas de despliegue en Render con MongoDB Atlas.

## 📧 Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.

---

**LENNIN S.A.C** - Sistema de Ventas © 2025
