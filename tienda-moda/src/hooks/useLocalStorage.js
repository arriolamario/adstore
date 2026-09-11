import { useCallback, useEffect, useState } from 'react'

/** Estado sincronizado con localStorage. Tolerante a errores (SSR, modo privado). */
export function useLocalStorage(key, initialValue) {
  const read = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  }, [key, initialValue])

  const [value, setValue] = useState(read)

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* almacenamiento no disponible */
    }
  }, [key, value])

  return [value, setValue]
}
