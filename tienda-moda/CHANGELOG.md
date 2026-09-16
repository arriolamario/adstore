# Changelog

Registro de cambios notables del proyecto. Formato libre pero constante:
fecha, y que cambio agrupado por tipo. Se actualiza **en el mismo commit**
que el cambio que describe — no despues.

## 2026-09-16 (noche)

### Agregado
- Las reservas se pueden **eliminar** desde `/admin/reservas` (solo admin).
  Nuevo `DELETE /api/orders/:id`.
- Si la reserva eliminada estaba activa (no cancelada ni entregada) se
  repone el stock antes de borrarla; si ya estaba cancelada o entregada,
  eliminarla no vuelve a tocar el stock.
- Se extrajo `adjustStockForItems` a `server/lib/stock.js`, compartido entre
  crear/cambiar-estado/eliminar reservas (antes estaba duplicado).
- 4 tests de integracion nuevos (36 en total): permisos (401/403), reposicion
  al eliminar una activa, sin reposicion al eliminar una ya entregada o ya
  cancelada.

## 2026-09-16 (aun mas tarde)

### Cambiado
- Se quito el horario de atencion (Lun a Sab 10 a 19 h) y el email de
  contacto (hola@adstore.com) del Footer y de la seccion del local en la
  home — ya no correspondian.

## 2026-09-16 (mas tarde)

### Cambiado
- El campo "Marca" del alta/edicion de productos (admin) ya no es obligatorio.
- Direccion real del local: Av. Fuerza Aerea 2778 (antes un placeholder),
  actualizada en el Footer y en la seccion "Reserva hoy, retira cuando quieras".

### Agregado
- Links a Instagram y WhatsApp en el Footer. Ademas, la seccion del local en
  la home tiene un boton directo "Escribinos por WhatsApp" (reemplaza al de
  "Crear cuenta", que ya esta presente en el navbar y el hero).

## 2026-09-16

### Agregado
- **CRUD de categorias para el admin** (`/admin/categorias`): crear, renombrar
  y eliminar, con edicion inline en la tabla (no hace falta una pantalla
  aparte para algo de un solo campo).
- Nueva tabla `categories` en Postgres (antes eran un array hardcodeado en
  `src/data/products.js`). Nuevas rutas: `GET /api/categories` (publica),
  `POST/PUT/DELETE /api/categories` (admin).
- `products.category` sigue siendo texto libre, no una FK (evita migrar datos
  existentes) — pero **renombrar una categoria actualiza en la misma
  transaccion** los productos que la usaban, y **no se puede eliminar una
  categoria que tiene productos** (409 con la cantidad).
- `CatalogContext.categories` ahora viene de la API en vez de un array
  estatico — Filters y el selector de categoria del admin de productos se
  actualizan solos apenas se crea/renombra/borra una categoria.
- 6 tests de integracion nuevos (32 en total): lectura publica, escritura
  solo-admin, nombre duplicado, cascada del rename, bloqueo de borrado en uso.

## 2026-09-11 (noche)

### Agregado
- **Autenticacion real en el servidor**: sesion como JWT en una cookie
  `httpOnly` (`server/lib/auth.js`), en vez de confiar en lo que el cliente
  dijera ser. Nuevos endpoints `GET /api/auth/me` y `POST /api/auth/logout`.
- Middlewares `requireAuth`, `requireAdmin`, `requireSelfOrAdmin` aplicados
  a **todas** las rutas sensibles: mutaciones de productos, todo el CRUD de
  usuarios, crear/listar/cambiar-estado de reservas.
- El dueno de una reserva pasa a ser siempre `req.user.id` (de la sesion),
  nunca el `userId` que mande el body — cierra el hueco de poder crear una
  reserva "a nombre de" otro usuario.
- Un comprador que intenta ponerse `role: "admin"` en su propio perfil ya
  no lo logra (el servidor ignora ese campo salvo que quien pide el cambio
  ya sea admin).
- `AuthContext` valida la sesion contra `GET /api/auth/me` al cargar la app
  en vez de confiar en `localStorage` (que ya no guarda la sesion).
  `ProtectedRoute` espera esa validacion antes de decidir si redirige.
- 26 tests de integracion nuevos/reescritos que prueban la autorizacion en
  si misma (no solo el "happy path"): acceso sin sesion, acceso con el rol
  equivocado, intento de spoofear el dueno de una reserva, intento de
  auto-promocion de rol.

### Cambiado
- Nueva variable de entorno obligatoria: `JWT_SECRET` (en `.env`, `.env.test`
  y — **hay que agregarla a mano en Vercel** — Production/Preview). Sin ella
  el servidor no arranca, mismo criterio que `DATABASE_URL`.

### Documentado
- `ARCHITECTURE.md` > "Seguridad" reemplaza la limitacion conocida anterior
  por el detalle del modelo de auth real (que exige cada ruta, por que JWT
  en cookie y no en localStorage, el trade-off de que el rol viaje dentro
  del token).

## 2026-09-11 (aun mas tarde)

### Agregado
- **CRUD de usuarios para el admin** (`/admin/usuarios`): listar, crear,
  editar (incluye cambiar de rol y resetear contrasena) y eliminar cuentas.
  Nuevas rutas `GET/POST /api/users`, `GET/PUT/DELETE /api/users/:id`.
  No se puede eliminar ni cambiar el rol de la propia cuenta logueada
  (evita quedarse afuera del panel por error).
- El checkout **guarda telefono y direccion en el perfil** del usuario al
  confirmar una reserva (si estaban vacios o cambiaron), asi la proxima
  reserva ya viene precargada.
- Tests de integracion del CRUD de usuarios (crear/listar/editar/eliminar,
  email duplicado, cambio de contrasena) en `server/app.test.js`.

### Documentado
- **Limitacion de seguridad conocida**: la API no verifica el rol en el
  servidor (el filtro admin es solo de UI). Ver ARCHITECTURE.md > "Seguridad".
  Aceptable para el estado actual del proyecto, pero a resolver antes de
  manejar datos reales de usuarios.

## 2026-09-11 (mas tarde)

### Agregado
- **Base de datos local**: PostgreSQL instalado en la maquina de desarrollo,
  con dos bases separadas — `adstore_dev` (desarrollo, `.env`) y `adstore_test`
  (tests, `.env.test`, se resetea automaticamente en cada corrida). Neon queda
  exclusivamente para produccion (Vercel).
- Tests de integracion reales del backend: `server/app.test.js` con
  `supertest`, contra la base local de test. Cubre el flujo completo de stock
  transaccional (crear reserva descuenta, sin stock devuelve 409, cancelar
  repone, reactivar vuelve a descontar) y auth (registro, login, duplicados).
  Corren con `npm run test:integration`, separados de `npm test` (que sigue
  siendo 100% unitario y no requiere ninguna base levantada).
- `npm run db:test:reset` para resetear la base de test a mano.

### Cambiado
- `server/db.js` desactiva SSL cuando el host es `localhost` (Postgres local
  no lo tiene configurado; Neon si lo exige).
- `server/migrate.js` acepta `--env=test` para migrar/sembrar `adstore_test`
  en vez de la base por defecto.

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
