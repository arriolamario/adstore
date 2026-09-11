# AdStore

Tienda premium de calzado y ropa construida con **React + Vite** para el frontend
y una **API Express + PostgreSQL (Neon)** para los datos. La landing esta orientada
a que el visitante **reserve productos** para envio a domicilio o retiro en el local.

Persisten en la base: usuarios, productos (con stock por talle) y reservas.
El carrito de compra (borrador antes de confirmar) sigue viviendo en el
`localStorage` del navegador — es intencional, evita crear filas por cada click.

## Levantar en local

1. Copia `.env.example` a `.env` y completa `DATABASE_URL` con tu cadena de Postgres
   (ya viene configurado para el Neon del proyecto).
2. Instala dependencias y prepara la base (esto **borra y recrea** las tablas):

```bash
npm install
npm run db:reset
```

3. Levanta API + frontend juntos:

```bash
npm run dev
```

Abre http://localhost:5173 (el frontend llama a `/api/*`, que Vite proxea a la
API en `http://localhost:3001`).

Otros scripts:

```bash
npm run dev:api    # solo la API (puerto 3001)
npm run dev:web    # solo el frontend (Vite)
npm run db:reset   # DROP + CREATE de las tablas y siembra el catalogo + admin
npm run build      # build de produccion del frontend en /dist
npm run start      # sirve la API + el build de /dist (produccion simple)
```

## Usuarios de prueba

| Rol       | Email                | Password   |
|-----------|----------------------|------------|
| Admin     | `admin@adstore.com`  | `admin123` |
| Comprador | se crea en /registro | —          |

- **Comprador**: agrega productos al carrito eligiendo talle (modal de vista rapida).
  Para **confirmar** la reserva se le pide crear cuenta / ingresar y luego vuelve
  al checkout con el carrito intacto. Checkout con envio o retiro, historial de
  pedidos con estado y edicion de perfil.
- **Admin**: `/admin` → alta/baja/edicion de stock **por talle**, carga de imagenes
  por producto (archivo o URL), **Reservas** (cambiar el estado de cada reserva) y
  reporte de ventas.

### Stock y estados de reserva

- Al **confirmar** una reserva se descuenta el stock por talle de los productos
  "en stock" (los productos "a pedido" no tienen tope).
- Estados: `Reservado → En preparacion → Listo → Entregado`, o `Cancelado`.
  El admin los cambia desde `/admin/reservas`. Cancelar **repone** el stock;
  reactivar una cancelada lo vuelve a descontar.

## Estructura

```
server/
├── db.js         # pool de conexion a Postgres (Neon)
├── schema.sql    # DROP + CREATE de users / products / orders
├── migrate.js    # corre schema.sql y siembra catalogo + admin (npm run db:reset)
└── index.js      # API Express (productos, auth, usuarios, reservas)

src/
├── main.jsx                # providers + router
├── App.jsx                 # definicion de rutas + layout
├── styles/
│   ├── theme.css           # ← TOKENS: colores, espaciados, tipografia, radios, sombras
│   ├── components.css      # estilos por componente (todos usan los tokens)
│   └── global.css          # reset + helpers de layout
├── data/products.js        # catalogo semilla (stock / a pedido)
├── context/                # AuthContext, CatalogContext, CartContext
├── hooks/useLocalStorage.js
├── lib/format.js           # moneda, fechas, dias habiles
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── ui/                 # Button, Badge, Field, Modal, Pagination, EmptyState
│   ├── home/               # Hero, TrustBar, HowItWorks, CTASection
│   ├── catalog/            # CatalogExplorer, Filters, ProductCard
│   └── cart/CartDrawer.jsx
└── pages/
    ├── HomePage / CatalogPage / ProductPage / CheckoutPage
    ├── LoginPage / RegisterPage
    ├── account/            # AccountLayout, OrdersPage, ProfilePage
    └── admin/              # AdminLayout, AdminProducts, AdminProductForm, AdminReports
```

## Como iterar el diseno

1. **Colores, tipografia, espaciados, radios y sombras** → `src/styles/theme.css`.
   Cambia una variable y se propaga a toda la app.
2. **Layout / spacing de un bloque puntual** → clase correspondiente en
   `src/styles/components.css` (agrupado por seccion con comentarios).
3. **Contenido del catalogo** → `src/data/products.js` (o desde `/admin`).
4. Los breakpoints estan en `640 / 860 / 900 px`; se ajustan en cada bloque.

Para reiniciar los datos: borra el `localStorage` del sitio o usa
"Restaurar catalogo" en el panel de admin.
