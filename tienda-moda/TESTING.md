# Tests

El proyecto usa **Vitest** (mismo motor que Vite, cero configuracion extra)
+ **React Testing Library** para lo que toca componentes/hooks de React.

## Correr los tests

```bash
npm test          # corre toda la suite una vez (usado en CI / antes de cada cambio)
npm run test:watch  # modo watch, para ir iterando
```

## Que esta cubierto hoy

| Archivo | Cubre |
|---|---|
| `src/lib/format.test.js` | `currency`, `addBusinessDays` (incluye el salto de fin de semana), `uid`, `slugify` |
| `src/lib/inventory.test.js` | `totalStock`, `sizeStock`, `isSoldOut`, `availableSizes` — las reglas de stock por talle |
| `src/lib/orders.test.js` | `statusMeta`, `statusLabel` (incluye el caso "listo para retiro" vs "listo para envio") |
| `src/lib/validation.test.js` | `sanitizePhone`, `isValidPhone` |
| `src/context/CartContext.test.jsx` | Carrito: agregar, topear cantidad al stock disponible, no agregar si esta agotado, productos a pedido sin tope, quitar con `setQty(0)` |

Estos son los puntos con mas logica de negocio real (calculo de stock,
fechas, estados, carrito) — donde un bug se nota como plata mal cobrada o
una reserva mal armada, no como un detalle visual.

## Que falta (a proposito, documentado como deuda)

- **Rutas del backend** (`server/routes/*`): hoy no tienen tests automatizados.
  Probarlas de verdad requiere una base de test (no la de Neon de produccion)
  y `supertest` para levantar la app Express en memoria. Se dejo afuera de
  esta iteracion para no arriesgar la base real ni agregar infraestructura
  de CI sin que el usuario lo pida. Si se suma, va en `server/routes/*.test.js`
  con un `beforeAll` que apunte a una base de test separada.
- **Componentes de UI** (paginas, formularios visuales): se prioriza la logica
  de negocio en `lib/` y `context/`. Se pueden sumar tests de render con
  Testing Library si aparecen bugs de UI recurrentes que valga la pena
  cubrir con un test.

## Convencion

- Un archivo de test vive al lado de lo que prueba: `foo.js` -> `foo.test.js`.
- Los tests de `lib/` no necesitan un componente de React alrededor: son
  funciones puras, se importan y se llaman directo.
- Los tests de `context/` usan `renderHook` + `act` de
  `@testing-library/react`, con un `wrapper` que envuelve en el Provider
  correspondiente. Limpiar `localStorage` en `beforeEach` para que un test
  no contamine al siguiente.

## Regla de trabajo

Cada vez que se modifica codigo con logica (no solo estilos/textos), correr
`npm test` antes de dar el cambio por terminado. Si el cambio agrega una
regla de negocio nueva (una validacion, un calculo, un estado nuevo), sumar
o actualizar el test correspondiente en el mismo cambio.
