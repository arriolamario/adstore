# AD Moda & Confort

Tienda premium de calzado y ropa construida con **React + Vite** para el frontend
y una **API Express + PostgreSQL (Neon)** para los datos. La landing esta orientada
a que el visitante **reserve productos** para envio a domicilio o retiro en el local.

Persisten en la base: usuarios, productos (con stock por talle) y reservas.
El carrito de compra (borrador antes de confirmar) sigue viviendo en el
`localStorage` del navegador — es intencional, evita crear filas por cada click.

Hay tambien una **app Android para el admin** en [`../admin-app/`](../admin-app/README.md)
(React Native + Expo), que habla con esta misma API.

## Documentacion

- [ARCHITECTURE.md](ARCHITECTURE.md) — patron de diseno, estructura de carpetas
  y cuando conviene escalarla.
- [TESTING.md](TESTING.md) — como correr los tests y que cubren.
- [CHANGELOG.md](CHANGELOG.md) — registro de cambios notables, actualizado en
  cada cambio con logica relevante.
- [postman/README.md](postman/README.md) — coleccion de Postman para probar
  la API a mano (login con Bearer token, todos los endpoints).

## Deploy en Vercel

El repo ya trae [vercel.json](vercel.json) y [api/index.js](api/index.js) (la API
Express corre como funcion serverless). Para que el deploy funcione hay que
configurar en el proyecto de Vercel (Settings del proyecto, no en el codigo):

1. **Root Directory**: la carpeta donde vive este `package.json` (p. ej. `tienda-moda`
   si el repo tiene varios proyectos).
2. **Framework Preset**: `Vite` (o `Other`) — si quedo en `Next.js` de un proyecto
   anterior, el build falla porque intenta correr `next build`.
3. **Environment Variables**: agregar `DATABASE_URL` (cadena de conexion a
   Postgres) y **`JWT_SECRET`** (clave para firmar las cookies de sesion —
   ver "Autenticacion" mas abajo) para Production y Preview. El `.env` local
   nunca se sube al repo. **Sin `JWT_SECRET` el servidor no arranca.**
4. Volver a desplegar (Redeploy) despues de guardar esos cambios.

## Base de datos local

El desarrollo local usa **Postgres instalado en tu maquina**, no Neon
(produccion) — asi las pruebas y los `db:reset` no tocan datos reales.
Neon solo lo usa el deploy de Vercel (su `DATABASE_URL` se configura en el
dashboard de Vercel, no en este repo).

1. Instala PostgreSQL (Windows: `winget install --id PostgreSQL.PostgreSQL.17 -e`,
   o el instalador de postgresql.org). Anota el password que le pongas al rol `postgres`.
2. Crea las dos bases locales (una para desarrollo, otra para tests — se
   mantienen separadas para que correr los tests no te pise datos que estabas
   probando a mano):

```sql
CREATE DATABASE adstore_dev;
CREATE DATABASE adstore_test;
```

3. Copia `.env.example` a `.env` (base `adstore_dev`) y tambien a `.env.test`
   (base `adstore_test`, puerto distinto), completando el password que elegiste.

## Levantar en local

1. Instala dependencias y prepara la base de desarrollo (esto **borra y
   recrea** las tablas de `adstore_dev`):

```bash
npm install
npm run db:reset
```

2. Levanta API + frontend juntos:

```bash
npm run dev
```

Abre http://localhost:5173 (el frontend llama a `/api/*`, que Vite proxea a la
API en `http://localhost:3001`).

Otros scripts:

```bash
npm run dev:api        # solo la API (puerto 3001)
npm run dev:web        # solo el frontend (Vite)
npm run db:reset       # DROP + CREATE de adstore_dev y siembra el catalogo + admin
npm run db:test:reset  # idem, contra adstore_test (usa .env.test)
npm run build          # build de produccion del frontend en /dist
npm run start          # sirve la API + el build de /dist (produccion simple)
npm test               # tests unitarios (Vitest), no tocan la base
npm run test:watch     # tests unitarios en modo watch
npm run test:integration  # tests de integracion contra adstore_test (API real por HTTP)
```

## Autenticacion

La sesion es una **cookie `httpOnly` firmada (JWT)**, no algo que quede
expuesto en `localStorage` — el servidor verifica la sesion y el rol en
**cada** ruta sensible (no solo en la pantalla, como pasaba antes). Detalle
completo en [ARCHITECTURE.md](ARCHITECTURE.md#seguridad).

Requiere la variable `JWT_SECRET` (ver `.env.example`). Generar una propia:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

## Emails transaccionales

Bienvenida (al registrarte o al crear un usuario desde el admin), confirmacion
de reserva y aviso de cambio de estado — via [Resend](https://resend.com).
**Es opcional**: sin `RESEND_API_KEY` configurada, el servidor simplemente
omite el envio (queda un log en la consola) — el registro y las reservas
funcionan igual.

1. Cuenta gratis en [resend.com](https://resend.com) (plan gratis: 3.000
   emails/mes) y generar una API key.
2. Completar en `.env` (local) y en las Environment Variables de Vercel
   (produccion): `RESEND_API_KEY`, `RESEND_FROM_EMAIL` (por defecto usa el
   dominio de pruebas de Resend) y `SITE_URL` (para los links dentro del
   email — en Vercel, la URL publica del sitio).
3. Para mandar desde tu propio dominio (`no-reply@tudominio.com` en vez del
   dominio de pruebas) hay que verificarlo en Resend (agrega unos registros
   DNS) y actualizar `RESEND_FROM_EMAIL`.

## Usuarios de prueba

| Rol       | Email                | Password   |
|-----------|----------------------|------------|
| Admin     | `admin@adstore.com`  | `admin123` |
| Comprador | se crea en /registro | —          |

- **Comprador**: agrega productos al carrito eligiendo talle (modal de vista rapida).
  Para **confirmar** la reserva se le pide crear cuenta / ingresar y luego vuelve
  al checkout con el carrito intacto. Checkout con envio o retiro, historial de
  pedidos con estado y edicion de perfil. El telefono y la direccion cargados en
  el checkout se guardan en el perfil, asi la proxima reserva ya viene precargada.
  Al confirmar, un boton abre WhatsApp con un mensaje prellenado para avisarle
  a la tienda (no es automatico: el cliente tiene que tocar Enviar — ver
  `src/lib/contact.js`).
- **Admin**: `/admin` → alta/baja/edicion de stock **por talle**, carga de imagenes
  por producto (archivo o URL), **Categorias** (crear, renombrar y eliminar — no
  se puede eliminar una categoria con productos), **Usuarios** (alta/baja/edicion,
  cambio de rol y reseteo de contrasena), **Reservas** (cambiar el estado de cada
  reserva, ver el detalle completo) y reporte de ventas.

### Stock y estados de reserva

- Al **confirmar** una reserva se descuenta el stock por talle de los productos
  "en stock" (los productos "a pedido" no tienen tope).
- Estados: `Reservado → En preparacion → Listo → Entregado`, o `Cancelado`.
  El admin los cambia desde `/admin/reservas`. Cancelar **repone** el stock;
  reactivar una cancelada lo vuelve a descontar.
- El admin tambien puede **eliminar** una reserva desde `/admin/reservas`.
  Si todavia estaba activa (no cancelada ni entregada), se repone el stock
  antes de borrarla.

## Estructura

```
api/
└── index.js      # funcion serverless de Vercel: reexporta server/app.js

server/
├── db.js         # pool de conexion a Postgres (Neon) + helper de transacciones
├── lib/          # http.js (wrap/fail), mappers.js (DB -> frontend), auth.js (JWT), stock.js, email.js (Resend)
├── routes/       # un router por recurso: products, categories, auth, users, orders
├── schema.sql    # DROP + CREATE de users / products / orders
├── migrate.js    # corre schema.sql y siembra catalogo + admin (npm run db:reset)
├── app.js        # composition root: crea la app Express y monta los routers
└── index.js      # entry point local: levanta app.js con app.listen (npm start)

src/
├── main.jsx                # providers + router
├── App.jsx                 # definicion de rutas + layout
├── test/setup.js           # setup de Vitest (matchers de jest-dom)
├── styles/
│   ├── theme.css           # ← TOKENS: colores, espaciados, tipografia, radios, sombras
│   ├── components.css      # estilos por componente (todos usan los tokens)
│   └── global.css          # reset + helpers de layout
├── data/products.js        # catalogo semilla (stock / a pedido), la reusa el backend
├── context/                # AuthContext, CatalogContext, CartContext (+ tests)
├── hooks/useLocalStorage.js
├── lib/                    # funciones puras + cliente HTTP (cada una con su .test.js)
│   ├── api.js                 # unico punto de contacto con /api/*
│   ├── inventory.js            # stock por talle
│   ├── orders.js                # estados de reserva
│   ├── validation.js             # sanitizadores/validadores de formularios
│   └── format.js                  # moneda, fechas, dias habiles, slugs
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── ui/                 # Button, Badge, Field, Modal, Pagination, EmptyState
│   ├── home/               # Hero, TrustBar, HowItWorks, CTASection
│   ├── catalog/            # CatalogExplorer, Filters, ProductCard, QuickReserveModal
│   ├── cart/                # CartDrawer
│   └── orders/               # OrderDetailModal (compartido por admin y reportes)
└── pages/
    ├── HomePage / CatalogPage / ProductPage / CheckoutPage
    ├── LoginPage / RegisterPage
    ├── account/            # AccountLayout, OrdersPage, ProfilePage
    └── admin/              # AdminLayout, AdminProducts(Form), AdminCategories, AdminUsers(Form), AdminOrders, AdminReports
```

Ver [ARCHITECTURE.md](ARCHITECTURE.md) para el detalle del patron y como escalarlo.

## Como iterar el diseno

1. **Colores, tipografia, espaciados, radios y sombras** → `src/styles/theme.css`.
   Cambia una variable y se propaga a toda la app.
2. **Layout / spacing de un bloque puntual** → clase correspondiente en
   `src/styles/components.css` (agrupado por seccion con comentarios).
3. **Contenido del catalogo** → `src/data/products.js` (o desde `/admin`).
4. Los breakpoints estan en `640 / 860 / 900 px`; se ajustan en cada bloque.

Para reiniciar los datos: borra el `localStorage` del sitio o usa
"Restaurar catalogo" en el panel de admin.
