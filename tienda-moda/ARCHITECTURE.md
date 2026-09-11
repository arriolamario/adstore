# Arquitectura

Resumen de como esta organizado el proyecto, que patron sigue y como escalarlo
a medida que crezca. Actualiza este archivo cuando cambies algo estructural
(una carpeta nueva, una capa nueva, un cambio de convencion).

## Vision general

Cliente-servidor clasico, sin framework full-stack:

```
Browser (React SPA)  <--fetch /api/*-->  Express API  <--pg-->  PostgreSQL (Neon)
```

- **Frontend**: React 18 + Vite + React Router. SPA pura, sin SSR.
- **Backend**: Express corriendo como servidor Node normal en local
  (`server/index.js`) y como funcion serverless en Vercel (`api/index.js`
  reexporta la misma app Express, ver `server/app.js`).
- **Base de datos**: PostgreSQL (Neon). Sin ORM — SQL parametrizado directo
  via `pg` (`server/db.js`). `products.sizes`/`stock` y `orders.items`/`customer`
  se guardan como `jsonb` para no tener que migrar el esquema cada vez que
  cambia la forma de un producto o una reserva.

## Patron: capas por responsabilidad (layered architecture)

Tanto el frontend como el backend siguen el mismo principio: **separar por
tipo de responsabilidad**, no por feature. Es el patron mas simple de razonar
para un equipo chico y un proyecto de este tamano (~50 archivos de app).

### Frontend (`src/`)

```
src/
├── pages/        Una pantalla = una ruta. Componen componentes + hooks de contexto.
│                  No tienen logica de negocio propia, solo orquestan.
├── components/    UI reutilizable, agrupada por area:
│   ├── ui/          Atomos genericos sin conocimiento del dominio (Button, Modal, Field...)
│   ├── layout/       Navbar, Footer — el esqueleto de toda pagina
│   ├── home/          Secciones exclusivas de la landing
│   ├── catalog/        Exploracion de productos (busqueda, filtros, card, quick-reserve)
│   ├── cart/            El drawer del carrito
│   └── orders/           Piezas compartidas de reservas (ej. OrderDetailModal)
├── context/       Estado global via React Context + hooks (useAuth, useCart, useCatalog).
│                   Es la "capa de aplicacion": orquesta llamadas a lib/api.js y
│                   expone acciones (addItem, createOrder...) a las paginas.
├── lib/           Funciones puras y el cliente HTTP:
│   ├── api.js        Unico punto de contacto con el backend (fetch a /api/*)
│   ├── inventory.js   Reglas de stock por talle (totalStock, sizeStock, isSoldOut...)
│   ├── orders.js       Estados de reserva y sus etiquetas
│   ├── validation.js    Sanitizadores/validadores de formularios (telefono, etc.)
│   └── format.js         Moneda, fechas, dias habiles, slugs
├── hooks/         Hooks genericos sin dominio (useLocalStorage)
├── data/          Catalogo semilla (unica fuente de verdad, la reusa tambien el backend)
└── styles/        theme.css (tokens) + components.css + global.css
```

Regla practica: si una funcion no usa `useState`/`useEffect` ni conoce React,
va en `lib/`. Si orquesta estado + llamadas a la API y varias pantallas la
necesitan, va en `context/`. Si es exclusiva de una sola pantalla, vive en
esa pantalla o en un componente bajo `components/<area>/`.

### Backend (`server/`)

```
server/
├── db.js              Pool de conexion + helper de transacciones (withTransaction)
├── lib/
│   ├── http.js           wrap() (captura errores async) y fail() (error con status)
│   └── mappers.js         DB (snake_case) -> frontend (camelCase)
├── routes/            Un router de Express por recurso (products, auth, users, orders)
│                        Cada uno es una lista de endpoints + su SQL, nada mas.
├── app.js             Composition root: crea la app Express y monta los routers.
├── index.js           Entry point solo para local (server/app.js + app.listen)
├── schema.sql          DROP + CREATE de las tablas
└── migrate.js          Corre schema.sql y siembra catalogo + admin (npm run db:reset)
```

`api/index.js` (en la raiz del proyecto) reexporta `server/app.js` tal cual
para que Vercel lo use como funcion serverless — no duplica logica.

## Por que esta separacion escala

- **Agregar un recurso nuevo** (ej. "cupones"): un `routes/coupons.routes.js`
  en el backend + un bloque en `lib/api.js` + (si hace falta estado global)
  un `context/CouponsContext.jsx` en el frontend. No hay que tocar nada mas.
- **Los routers son finos**: cada uno es una lista de endpoints con su SQL,
  sin logica compartida duplicada (eso vive en `lib/http.js` y `lib/mappers.js`).
- **Las reglas de negocio no dependen de React ni de Express**: `lib/inventory.js`,
  `lib/orders.js` y `lib/validation.js` son funciones puras, testeables sin
  levantar un componente ni un servidor (ver `TESTING.md`).
- **Un solo esquema de datos**: `src/data/products.js` es la semilla que usa
  tanto `server/migrate.js` como el boton "Restaurar catalogo" del admin.

## Cuando migrar a una estructura por feature

Con el tamano actual (~50 archivos) la organizacion por tipo es la mas facil
de navegar. El punto donde conviene migrar a carpetas por feature
(`features/catalog/`, `features/orders/`, `features/admin/`, cada una con
sus propios componentes + hooks + tests) es cuando alguna de estas carpetas
"tipo" empiece a doler:

- `components/` supera ~25-30 archivos y cuesta encontrar algo por nombre.
- Dos features necesitan versiones distintas de un mismo componente "generico".
- Un mismo dominio (ej. "orders") queda repartido en mas de 4-5 carpetas
  distintas (components/orders, pages/admin, pages/account, context, lib) y
  cambiar una regla de negocio obliga a tocar archivos en todas.

No hace falta anticiparlo: la migracion es mecanica (mover archivos y
actualizar imports) porque las capas ya estan bien separadas.

## Estado global vs. servidor vs. localStorage

Para evitar dudas de "donde vive cada dato":

| Dato | Vive en | Por que |
|---|---|---|
| Catalogo de productos | Postgres (`products`) | Fuente de verdad compartida por todos |
| Reservas confirmadas | Postgres (`orders`) | Idem, y necesitan transacciones (stock) |
| Usuarios | Postgres (`users`) | Idem |
| Carrito (borrador, sin confirmar) | `localStorage` del navegador | Evita crear filas en la DB por cada click; se descarta o se confirma como reserva |
| Sesion (usuario logueado) | `localStorage` del navegador | Solo dice "quien sos"; los datos reales estan en la DB |

## Entornos y bases de datos

Tres bases de Postgres, cada una con un proposito distinto — nunca se mezclan:

| Entorno | Base | Configurada en | Se resetea |
|---|---|---|---|
| Desarrollo local | `adstore_dev` (Postgres local) | `.env` | manual (`npm run db:reset`) |
| Tests de integracion | `adstore_test` (Postgres local) | `.env.test` | automatico, en cada corrida (`npm run test:integration`) |
| Produccion | Neon (nube) | Variables de entorno del proyecto en Vercel | nunca desde el codigo |

`server/db.js` detecta si el host es `localhost` para desactivar SSL (Postgres
local no lo tiene configurado por defecto; Neon lo exige). Ver `TESTING.md`
para el detalle de como los tests de integracion cargan `.env.test`.

## Seguridad — limitacion conocida

El backend **no verifica el rol en el servidor**. `/admin/*` en el frontend
esta protegido por `ProtectedRoute` (oculta la UI si `user.role !== 'admin'`),
pero las rutas de la API (`/api/products`, `/api/users`, `/api/orders/:id/status`...)
responden a cualquiera que las llame directo, sin sesion ni token. Es
aceptable para el estado actual del proyecto (demo/portfolio, sin datos de
pago), pero **antes de manejar datos reales de usuarios habria que agregar
autenticacion real en el servidor** (sesion con cookie firmada o JWT +
middleware que valide `role === 'admin'` en cada ruta sensible, en particular
`server/routes/users.routes.js` completo y las mutaciones de `products.routes.js`
y `orders.routes.js`). No se implemento en esta iteracion para no introducir
un sistema de auth nuevo sin que el usuario lo pida explicitamente.

## Deploy

Ver la seccion "Deploy en Vercel" del `README.md`.
