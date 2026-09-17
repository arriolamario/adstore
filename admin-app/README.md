# AD Moda Admin (app Android)

App para que el administrador maneje la tienda desde el celular: reservas
(ver detalle, cambiar estado, eliminar), productos (alta/baja/edicion con
foto), categorias, usuarios y el reporte de ventas. Habla con la misma API
Express que usa el sitio web (`tienda-moda/`) — no es un backend aparte.

React Native + [Expo](https://expo.dev) (managed workflow).

## Antes de correrla: configurar la URL de la API

Editar `src/lib/config.js`:

```js
export const API_BASE_URL = 'http://TU_IP_LOCAL:3001'
```

- **Desarrollo**: la IP de tu compu en la red WiFi (no `localhost` — el
  celular es un dispositivo aparte). En Windows: `ipconfig` → "Direccion
  IPv4". El celular y la compu tienen que estar en la **misma red WiFi**, y
  la API tiene que estar corriendo (`npm run dev:api` en `tienda-moda/`).
- **Produccion**: la URL del sitio en Vercel (la API vive bajo `/api` en el
  mismo dominio), ej. `https://ad-moda.vercel.app`.

Solo entran usuarios con rol `admin` (los mismos que ya usan `/admin` en el
sitio web) — el login rechaza cuentas de comprador.

## Correr en desarrollo

```bash
cd admin-app
npm install
npm start
```

Esto abre el Dev Tools de Expo (una pagina/terminal con un codigo QR). Para
probarla en tu celular Android sin instalar nada mas:

1. Instalar **Expo Go** desde Play Store.
2. Escanear el QR con la app Expo Go (o con la camara, si Expo Go esta
   instalado detecta el link solo).

Cambios en el codigo se reflejan solos (hot reload).

## Generar un APK instalable de verdad

Para algo mas alla de Expo Go (un `.apk` para instalar directo, o subir a
Play Store) se usa [EAS Build](https://docs.expo.dev/build/introduction/) de
Expo (tiene un plan gratis con limite de builds por mes):

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview   # genera un .apk instalable
```

Para publicar en Play Store hace falta ademas una cuenta de Google Play
Developer (USD 25, pago unico) — eso no lo puede resolver `eas build`, se
gestiona aparte en [play.google.com/console](https://play.google.com/console).

## Estructura

```
App.js                    Providers (Auth) + navegador raiz
src/
├── lib/
│   ├── config.js            API_BASE_URL — EDITAR ANTES DE CORRER
│   ├── api.js                Cliente HTTP (token via header Authorization)
│   ├── theme.js                Paleta, calcada de tienda-moda/src/styles/theme.css
│   ├── format.js, orders.js, inventory.js   Espejo de las mismas de tienda-moda/src/lib
│                                             (duplicadas a proposito, ver nota en cada archivo)
├── context/AuthContext.js  Login/logout, token persistido con expo-secure-store
├── components/             Button, Badge, Card, Field, Screen (UI generica)
├── screens/                Una pantalla por seccion del admin
└── navigation/RootNavigator.js   Login -> tabs (Reservas/Productos/Categorias/Usuarios/Reportes)
```

## Que falta (primera version, documentado a proposito)

- **Notificaciones push** cuando entra una reserva nueva — el paso natural
  siguiente ahora que hay una app de verdad (con Expo Go no funcionan pushes
  remotos sin mas configuracion; con un build standalone via EAS si).
- **Reportes**: version simplificada del reporte del sitio web (totales y
  top 5 productos). Si hace falta mas detalle, se amplia.
- **Sin tests automatizados todavia** (a diferencia de `tienda-moda/`, que
  si los tiene — ver su `TESTING.md`). Se probo manualmente + `expo export`
  para confirmar que el bundle compila sin errores.
