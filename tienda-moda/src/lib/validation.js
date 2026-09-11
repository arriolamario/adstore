/* Validadores y sanitizadores de formularios, reutilizables en toda la app. */

/** Deja pasar solo digitos (0-9). Uso: onChange={(e) => set(sanitizePhone(e.target.value))} */
export const sanitizePhone = (value) => value.replace(/\D+/g, '').slice(0, 15)

/** Un telefono valido tiene entre 8 y 15 digitos (criterio laxo, cubre fijo/movil/con codigo de pais). */
export const isValidPhone = (value) => /^\d{8,15}$/.test(value)
