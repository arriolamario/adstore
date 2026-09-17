/* Configuracion de la app. IMPORTANTE: editar API_BASE_URL antes de correrla.
   - Desarrollo local: la IP de tu compu en la red WiFi (no "localhost" —
     el celular es un dispositivo aparte, "localhost" apuntaria a si mismo).
     Windows: ipconfig -> "Direccion IPv4". Ej: http://192.168.1.100:3001
   - Produccion: la URL del sitio en Vercel, ej: https://ad-moda.vercel.app
     (la API vive en el mismo dominio, bajo /api). */
export const API_BASE_URL = 'http://192.168.1.100:3001'
