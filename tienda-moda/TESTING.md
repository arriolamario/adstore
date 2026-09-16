# Tests

El proyecto tiene dos suites, separadas a proposito:

- **Unitarios** (`npm test`): Vitest + React Testing Library. Funciones puras
  y hooks de React. No tocan ninguna base de datos, corren en cualquier
  maquina sin configuracion extra.
- **Integracion** (`npm run test:integration`): Vitest + `supertest`. Levantan
  la app Express real y le pegan peticiones HTTP de verdad contra una base de
  Postgres **local** de test (`adstore_test`, ver README > "Base de datos local").

## Correr los tests

```bash
npm test                  # unitarios, una vez
npm run test:watch        # unitarios, modo watch
npm run test:integration  # integracion (necesita Postgres local corriendo y adstore_test creada)
```

`npm run test:integration` borra y recrea las tablas de `adstore_test` al
arrancar (mismo `schema.sql` que usa `db:reset`) — es intencional, cada
corrida parte de una base limpia. Nunca corras esto apuntando a Neon/produccion.

## Que esta cubierto hoy

### Unitarios

| Archivo | Cubre |
|---|---|
| `src/lib/format.test.js` | `currency`, `addBusinessDays` (incluye el salto de fin de semana), `uid`, `slugify` |
| `src/lib/inventory.test.js` | `totalStock`, `sizeStock`, `isSoldOut`, `availableSizes` — las reglas de stock por talle |
| `src/lib/orders.test.js` | `statusMeta`, `statusLabel` (incluye "listo para retiro" vs "listo para envio") |
| `src/lib/validation.test.js` | `sanitizePhone`, `isValidPhone` |
| `src/context/CartContext.test.jsx` | Carrito: agregar, topear cantidad al stock disponible, no agregar si esta agotado, productos a pedido sin tope, quitar con `setQty(0)` |

### Integracion

| Archivo | Cubre |
|---|---|
| `server/app.test.js` | **Auth**: login/registro dejan sesion valida (`/me`), sin cookie da 401, logout invalida la sesion, email duplicado (409), password incorrecta (401). **Autorizacion** (lo mas importante — confirma que la proteccion por rol funciona de verdad): productos y categorias publicos en lectura pero mutacion solo-admin (401 sin sesion, 403 como comprador), usuarios (listado solo-admin, un comprador ve/edita su propio perfil pero no el de otro, **un comprador que manda `role:"admin"` en su propio perfil NO se auto-promueve**, un admin si puede cambiar el rol de otro, no se puede eliminar la propia cuenta), reservas (crear sin sesion da 401, **la reserva queda a nombre del usuario de la sesion aunque el body intente spoofear otro `userId`**, un comprador solo ve sus propias reservas, cambiar el estado es solo-admin). **Categorias**: nombre duplicado da 409, **renombrar actualiza `products.category` de los productos que la usaban**, **no se puede eliminar una categoria con productos** (409). **Stock transaccional**: crear una reserva descuenta el stock del talle en la base real, pedir mas de lo disponible devuelve 409 y no descuenta nada, cancelar repone el stock, reactivar una cancelada lo vuelve a descontar. |

Los tests de autorizacion usan `request.agent(app)` de supertest (no
`request(app)` suelto): un agent persiste la cookie de sesion entre
llamadas, igual que un navegador real — se loguea una vez (`adminAgent`,
`customerAgent`) y despues cada pedido en ese `describe` ya va autenticado.

Estos son los puntos con mas logica de negocio real (calculo de stock,
fechas, estados, carrito, transacciones SQL) — donde un bug se nota como
plata mal cobrada o una reserva mal armada, no como un detalle visual.

## Que falta (a proposito, documentado como deuda)

- **Componentes de UI** (paginas, formularios visuales): se prioriza la logica
  de negocio en `lib/`, `context/` y `server/routes/`. Se pueden sumar tests
  de render con Testing Library si aparecen bugs de UI recurrentes que valga
  la pena cubrir con un test.
- **CI**: los tests de integracion necesitan Postgres local levantado; si se
  agrega un pipeline de CI, hay que levantar un servicio de Postgres ahi
  tambien (la mayoria de los CI, incluido GitHub Actions, lo soportan como
  "service container" con una linea de config).

## Convencion

- Un archivo de test vive al lado de lo que prueba: `foo.js` -> `foo.test.js`.
- Los tests de `lib/` no necesitan un componente de React alrededor: son
  funciones puras, se importan y se llaman directo.
- Los tests de `context/` usan `renderHook` + `act` de
  `@testing-library/react`, con un `wrapper` que envuelve en el Provider
  correspondiente. Limpiar `localStorage` en `beforeEach` para que un test
  no contamine al siguiente.
- Los tests de integracion (`server/*.test.js`) cargan `.env.test` ellos
  mismos (`dotenv.config({ path: '.env.test', override: true })`) **antes**
  de importar `db.js`/`app.js` via `import()` dinamico — un `import` estatico
  se evalua antes que cualquier otro codigo del archivo, asi que no alcanza
  con poner el `dotenv.config` arriba del archivo si el resto de los imports
  son estaticos. Usan su propia config de Vitest (`vitest.integration.config.js`)
  para no correr por accidente junto con los unitarios ni en el entorno jsdom.
- Los errores 4xx esperados (login incorrecto, stock insuficiente, etc.) se
  ven como `Error: ...` en el stderr de la corrida de integracion — es el
  `console.error` del manejador de errores del servidor, no una falla del
  test. Si el test termina en verde, el caso funciono como se esperaba.

## Regla de trabajo

Cada vez que se modifica codigo con logica (no solo estilos/textos), correr
`npm test` antes de dar el cambio por terminado. Si el cambio toca una ruta
del backend, correr tambien `npm run test:integration`. Si el cambio agrega
una regla de negocio nueva (una validacion, un calculo, un estado nuevo,
un endpoint), sumar o actualizar el test correspondiente en el mismo cambio.
