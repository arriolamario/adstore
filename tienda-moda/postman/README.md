# Probar la API con Postman

Dos archivos para importar en Postman (**File → Import**, arrastralos o
seleccionalos):

- `AD-Moda-API.postman_collection.json` — todos los endpoints, organizados
  en carpetas (Auth, Productos, Categorias, Usuarios, Reservas).
- `AD-Moda-Local.postman_environment.json` — variables para apuntar a tu
  API local. Elegila en el selector de entorno arriba a la derecha de
  Postman antes de mandar requests.

## Como se resuelve el login

La API usa **JWT**: en el navegador viaja en una cookie, pero para clientes
sin cookie jar (como Postman, o la app movil) `login`/`register` devuelven
el token tambien en el **body** de la respuesta. La colección ya viene
armada para esto:

1. Correr el request **Auth → Login (admin)** (ya tiene cargado
   `admin@adstore.com` / `admin123` — cambialo si usas otra cuenta). Su
   script de test guarda el token solo, en la variable de coleccion `token`.
2. Todos los demas requests usan `Bearer {{token}}` automaticamente (esta
   configurado a nivel coleccion) — no hay que tocar headers a mano.
3. El token vence a los 7 dias; si empezas a recibir 401, volve a correr el
   Login.

## Ids encadenados

Los requests de **Crear** (producto, categoria, usuario, reserva) guardan
el id creado en una variable de coleccion (`productId`, `categoryId`,
`userId`, `orderId`), que despues usan los requests de **Editar** /
**Eliminar** / **Cambiar estado**. Podes correr la carpeta entera de una
(botón "Run folder") y va a encadenar todo solo, o ir tocando requests
sueltos y cambiando esas variables a mano si preferis apuntar a un id
puntual.

## Antes de probar "Crear reserva"

Ese request usa `{{productId}}` con talle `40` — asegurate de haber corrido
antes **Productos → Crear (admin)** (crea justo un producto con talle `40`
y stock), o cambiar el body por un producto/talle que ya exista en tu base.

## Local vs. produccion

El environment trae `baseUrl = http://localhost:3001` (requiere tener la
API corriendo: `npm run dev:api` en esta carpeta). Para probar contra
Vercel, duplicá el environment y poné `baseUrl` en la URL del sitio
desplegado (la API vive bajo `/api` en el mismo dominio) — ojo que ahi vas
a estar pegandole a la base de **produccion** (Neon), no a la local.
