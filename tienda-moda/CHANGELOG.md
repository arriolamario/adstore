# Changelog

Registro de cambios notables del proyecto. Formato libre pero constante:
fecha, y que cambio agrupado por tipo. Se actualiza **en el mismo commit**
que el cambio que describe — no despues.

## 2026-09-11

### Agregado
- Validacion de telefono: el campo solo acepta digitos (checkout y perfil),
  con `sanitizePhone`/`isValidPhone` en `src/lib/validation.js`.
- Detalle de reserva para el admin: `OrderDetailModal` (items, cliente,
  entrega) accesible desde "Reservas" y desde "Reporte de ventas" — antes
  solo se veia un resumen en un tooltip.
- Suite de tests con Vitest + React Testing Library (`npm test`): cubre
  `lib/format`, `lib/inventory`, `lib/orders`, `lib/validation` y el
  comportamiento del carrito (`context/CartContext`). Ver `TESTING.md`.
- `ARCHITECTURE.md`: documenta el patron (capas por responsabilidad),
  la estructura de carpetas y cuando conviene migrar a organizacion por
  feature.
- `TESTING.md`: como correr los tests, que cubren y que falta a proposito.

### Cambiado
- Backend: `server/app.js` (200+ lineas, todo junto) se separo en
  `server/routes/{products,auth,users,orders}.routes.js` +
  `server/lib/{http,mappers}.js`. Mismo comportamiento, mas facil de
  extender (un router nuevo por recurso).

## 2026-09-11 (antes)

### Cambiado
- Rebranding: "AdStore" -> "AD Moda & Confort" en toda la UI y el README
  (nombre corto "AD Moda" en el navbar por espacio). Emails sin cambios.
- Paleta de colores y logo actualizados a partir del logo real de la marca.

## 2026-09-10

### Agregado
- Persistencia en PostgreSQL (Neon) via una API Express: productos, usuarios
  y reservas dejan de vivir solo en `localStorage`.
- Stock por talle (antes era un numero unico por producto) con descuento
  transaccional al confirmar una reserva y reposicion al cancelarla.
- Estados de reserva (`reservado -> preparando -> listo -> entregado` o
  `cancelado`) editables por el admin desde `/admin/reservas`.
- Flujo de registro obligatorio antes de confirmar una reserva.
- Deploy en Vercel: API Express como funcion serverless (`api/index.js`).

### Base
- Primera version de la landing: React + Vite, catalogo con busqueda/filtros/
  paginacion, carrito, checkout, cuenta de usuario y panel de administracion.
