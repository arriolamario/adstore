import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import { useCatalog } from '../../context/CatalogContext'

const BLANK = {
  name: '', brand: '', category: 'Zapatillas', price: 0,
  availability: 'stock', stock: {}, sizes: '', image: '', description: '',
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=800&q=70'

const toForm = (p) => ({ ...p, stock: p.stock || {}, sizes: p.sizes?.join(', ') || '' })

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProduct, saveProduct, categories, loading } = useCatalog()
  const fileRef = useRef(null)

  const existing = id ? getProduct(id) : null
  const [form, setForm] = useState(() => (existing ? toForm(existing) : BLANK))
  const [hydrated, setHydrated] = useState(!id || !!existing)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // El catalogo llega async: cuando aparece el producto a editar, poblamos el form.
  useEffect(() => {
    if (id && existing && !hydrated) {
      setForm(toForm(existing))
      setHydrated(true)
    }
  }, [id, existing, hydrated])

  const parsedSizes = form.sizes.split(',').map((s) => s.trim()).filter(Boolean)
  const isStock = form.availability === 'stock'
  const totalUnits = parsedSizes.reduce((n, s) => n + (Number(form.stock?.[s]) || 0), 0)

  const set = (k) => (e) => {
    const v = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setForm((f) => ({ ...f, [k]: v }))
  }

  const setSizeStock = (size, value) =>
    setForm((f) => ({ ...f, stock: { ...f.stock, [size]: Math.max(0, Number(value) || 0) } }))

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result }))
    reader.readAsDataURL(file)
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    const stock = isStock
      ? parsedSizes.reduce((acc, s) => ({ ...acc, [s]: Number(form.stock?.[s]) || 0 }), {})
      : {}
    try {
      await saveProduct({
        ...form,
        id: existing?.id,
        price: Number(form.price),
        image: form.image || PLACEHOLDER,
        sizes: parsedSizes,
        stock,
      })
      navigate('/admin')
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  if (id && !existing) {
    return <p className="text-muted">{loading ? 'Cargando producto…' : 'Producto no encontrado.'}</p>
  }

  return (
    <form className="card card--pad" onSubmit={submit}>
      <h3 style={{ marginBottom: 'var(--space-5)' }}>{existing ? 'Editar producto' : 'Nuevo producto'}</h3>

      <div
        className="uploader"
        onClick={() => fileRef.current?.click()}
        style={{ marginBottom: 'var(--space-5)' }}
      >
        {form.image ? (
          <img src={form.image} alt="Vista previa" />
        ) : (
          <p className="text-muted">Clic para subir una imagen (JPG / PNG)</p>
        )}
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
      </div>
      <Field
        label="…o pega una URL de imagen"
        name="image"
        value={form.image?.startsWith('data:') ? '' : form.image}
        onChange={set('image')}
        placeholder="https://…"
      />

      <div className="form-row">
        <Field label="Nombre" name="name" value={form.name} onChange={set('name')} required />
        <Field label="Marca (opcional)" name="brand" value={form.brand} onChange={set('brand')} />
      </div>

      <div className="form-row">
        <Field as="select" label="Categoria" name="category" value={form.category} onChange={set('category')}>
          {categories.map((c) => <option key={c}>{c}</option>)}
        </Field>
        <Field label="Precio (ARS)" type="number" name="price" min="0" value={form.price} onChange={set('price')} required />
      </div>

      <div className="form-row">
        <Field as="select" label="Disponibilidad" name="availability" value={form.availability} onChange={set('availability')}>
          <option value="stock">En stock</option>
          <option value="order">A pedido (~5 dias)</option>
        </Field>
        <Field
          label="Talles (separados por coma)"
          name="sizes"
          value={form.sizes}
          onChange={set('sizes')}
          placeholder="38, 39, 40, 41"
          hint="Define primero los talles; luego cargas el stock de cada uno."
        />
      </div>

      {isStock && (
        <div className="field">
          <label>Stock por talle</label>
          {parsedSizes.length === 0 ? (
            <span className="hint">Agrega talles arriba para cargar unidades.</span>
          ) : (
            <>
              <div className="size-stock-grid">
                {parsedSizes.map((s) => (
                  <label key={s} className="size-stock-grid__item">
                    <span>{s}</span>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={form.stock?.[s] ?? 0}
                      onChange={(e) => setSizeStock(s, e.target.value)}
                    />
                  </label>
                ))}
              </div>
              <span className="hint">Total en stock: <strong>{totalUnits}</strong> unidades</span>
            </>
          )}
        </div>
      )}

      <Field as="textarea" label="Descripcion" name="description" value={form.description} onChange={set('description')} />

      {error && <p className="badge badge--order" style={{ marginBottom: 'var(--space-3)' }}>{error}</p>}

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <Button type="submit" disabled={busy}>
          {busy ? 'Guardando…' : existing ? 'Guardar cambios' : 'Crear producto'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => navigate('/admin')}>Cancelar</Button>
      </div>
    </form>
  )
}
