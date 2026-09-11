import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { CATEGORIES } from '../data/products'
import { api } from '../lib/api'

const CatalogContext = createContext(null)

export function CatalogProvider({ children }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const list = await api.products.list()
      setProducts(list)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const getProduct = useCallback((id) => products.find((p) => p.id === id) || null, [products])

  const saveProduct = useCallback(async (data) => {
    const exists = data.id && products.some((p) => p.id === data.id)
    const saved = exists ? await api.products.update(data.id, data) : await api.products.create(data)
    await refresh()
    return saved.id
  }, [products, refresh])

  const deleteProduct = useCallback(async (id) => {
    await api.products.remove(id)
    await refresh()
  }, [refresh])

  const resetCatalog = useCallback(async () => {
    const list = await api.products.reset()
    setProducts(list)
  }, [])

  const value = {
    products,
    categories: CATEGORIES,
    loading,
    error,
    refresh,
    getProduct,
    saveProduct,
    deleteProduct,
    resetCatalog,
  }

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export const useCatalog = () => {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog debe usarse dentro de <CatalogProvider>')
  return ctx
}
