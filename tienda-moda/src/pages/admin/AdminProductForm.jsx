import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../../components/ui/Button'
import Field from '../../components/ui/Field'
import { stockKey } from '../../lib/inventory'
import { useCatalog } from '../../context/CatalogContext'

const BLANK = {
  name: '', brand: '', category: 'Zapatillas', price: 0,
  availability: 'stock', stock: {}, sizes: '', colors: [], image: '', description: '', hidden: false,
}

const PLACEHOLDER = 'https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=800&q=70'

const toForm = (p) => ({ ...p, stock: p.stock || {}, colors: p.colors || [], sizes: p.sizes?.join(', ') || '' })

export default function AdminProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getProduct, saveProduct, categories, loading } = useCatalog()
  const fileRef = useRef(null)

  const existing = id ? getProduct(id) : null
  const [form, setForm] = useState(() => (existing ? toForm(existing) : BLANK))
  const [hydrated, setHydrated] = useState(!id || !!existing)
  const [useColors, setUseColors] = useState(() => (existing?.colors?.length > 0))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // El catalogo llega async: cuando aparece el producto a editar, poblamos el form.
  useEffect(() => {
    if (id && existing && !hydrated) {
      setForm(toForm(existing))
      setUseColors(existing.colors?.length > 0)
      setHydrated(true)
    }
  }, [id, existing, hydrated])

  const parsedSizes = form.sizes.split(',').map((s) => s.trim()).filter(Boolean)
  const isStock = form.availability === 'stock'
  const totalUnits = Object.values(form.stock || {}).reduce((n, v) => n + (Number(v) || 0), 0)

  const set = (k) => (e) => {
    const v = e.target.type === 'number' ? Number(e.target.value) : e.target.value
    setForm((f) => ({ ...f, [k]: v }))
  }

  const setSizeStock = (size, color, value) =>
    setForm((f) => ({ ...f, stock: { ...f.stock, [stockKey(size, color)]: Math.max(0, Number(value) || 0) } }))

  const onFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result }))
    reader.readAsDataURL(file)
  }

  const addColor = () => setForm((f) => ({ ...f, colors: [...f.colors, { name: '', image: '' }] }))
  const removeColor = (idx) => setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }))
  const setColorName = (idx, name) => setForm((f) => ({
    ...f, colors: f.colors.map((c, i) => (i === idx ? { ...c, name } : c)),
  }))
  const setColorImage = (idx, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setForm((f) => ({
      ...f, colors: f.colors.map((c, i) => (i === idx ? { ...c, image: reader.result } : c)),
    }))
    reader.readAsDataURL(file)
  }

  const colorNames = useColors ? form.colors.map((c) => c.name.trim()).filter(Boolean) : []

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (useColors && form.colors.some((c) => !c.name.trim())) {
      return setError('Todos los colores necesitan un nombre (o quitalos).')
    }
    setBusy(true)
    const stock = isStock
      ? (useColors
        ? parsedSizes.reduce((acc, s) => ({
          ...acc,
          ...colorNames.reduce((cacc, c) => ({ ...cacc, [stockKey(s, c)]: Number(form.stock?.[stockKey(s, c)]) || 0 }), {}),
        }), {})
        : parsedSizes.reduce((acc, s) => ({ ...acc, [s]: Number(form.stock?.[s]) || 0 }), {}))
      : {}
    try {
      await saveProduct({
        ...form,
        id: existing?.id,
        price: Number(form.price),
        image: form.image || PLACEHOLDER,
        sizes: parsedSizes,
        colors: useColors ? form.colors.map((c) => ({ name: c.name.trim(), image: c.image || '' })) : [],
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
        hint="Esta es la foto de portada. Si el producto tiene colores, cada uno puede tener la suya propia."
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

      <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-2)' }}>
        <input type="checkbox" checked={useColors} onChange={(e) => setUseColors(e.target.checked)} />
        <span style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>Este producto tiene variantes de color</span>
      </label>

      {useColors && (
        <div className="field">
          <label>Colores</label>
          {form.colors.map((c, idx) => (
            <div key={idx} className="color-row">
              <div className="color-row__thumb">
                {c.image ? <img src={c.image} alt="" /> : <span className="hint">Sin foto</span>}
                <input type="file" accept="image/*" onChange={(e) => setColorImage(idx, e)} />
              </div>
              <input
                className="input"
                placeholder="Nombre del color (ej. Negro)"
                value={c.name}
                onChange={(e) => setColorName(idx, e.target.value)}
              />
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeColor(idx)}>Quitar</button>
            </div>
          ))}
          <Button type="button" variant="secondary" size="sm" onClick={addColor} style={{ marginTop: 'var(--space-2)' }}>
            + Agregar color
          </Button>
        </div>
      )}

      {isStock && (
        <div className="field">
          <label>Stock por talle{useColors ? ' y color' : ''}</label>
          {parsedSizes.length === 0 ? (
            <span className="hint">Agrega talles arriba para cargar unidades.</span>
          ) : useColors ? (
            colorNames.length === 0 ? (
              <span className="hint">Agrega al menos un color con nombre para cargar su stock.</span>
            ) : (
              <>
                {colorNames.map((c) => (
                  <div key={c} style={{ marginBottom: 'var(--space-3)' }}>
                    <span className="hint" style={{ fontWeight: 700 }}>{c}</span>
                    <div className="size-stock-grid">
                      {parsedSizes.map((s) => (
                        <label key={s} className="size-stock-grid__item">
                          <span>{s}</span>
                          <input
                            className="input"
                            type="number"
                            min="0"
                            value={form.stock?.[stockKey(s, c)] ?? 0}
                            onChange={(e) => setSizeStock(s, c, e.target.value)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <span className="hint">Total en stock: <strong>{totalUnits}</strong> unidades</span>
              </>
            )
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
                      onChange={(e) => setSizeStock(s, undefined, e.target.value)}
                    />
                  </label>
                ))}
              </div>
              <span className="hint">Total en stock: <strong>{totalUnits}</strong> unidades</span>
            </>
          )}
        </div>
      )}

      <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: 'var(--space-2)' }}>
        <input
          type="checkbox"
          checked={!!form.hidden}
          onChange={(e) => setForm((f) => ({ ...f, hidden: e.target.checked }))}
        />
        <span style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>Ocultar del catalogo publico</span>
      </label>
      {form.hidden && (
        <p className="hint" style={{ marginTop: '-0.75rem', marginBottom: 'var(--space-4)' }}>
          No aparece en la tienda para los visitantes; vos seguis viendolo en el admin y podes reservarlo igual
          (por si es para un cliente puntual).
        </p>
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
