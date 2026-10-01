import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useAuth } from './AuthContext'

const CatalogContext = createContext(null)

export function CatalogProvider({ children }) {
  const { isAdmin } = useAuth()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([]) // nombres (string[]) — el CRUD completo vive en /admin/categorias
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Un admin logueado ve tambien los productos ocultos (en el catalogo
  // publico y en /admin) — asi puede previsualizarlos antes de publicarlos
  // sin necesitar una pantalla aparte. El servidor es quien decide esto de
  // verdad (ver server/routes/products.routes.js); isAdmin solo arma el pedido.
  const refresh = useCallback(async () => {
    try {
      setError(null)
      const [productList, categoryList] = await Promise.all([api.products.list(isAdmin), api.categories.list()])
      setProducts(productList)
      setCategories(categoryList.map((c) => c.name))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [isAdmin])

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
    categories,
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
