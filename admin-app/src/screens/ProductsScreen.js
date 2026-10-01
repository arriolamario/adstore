import { useCallback, useEffect, useState } from 'react'
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as ImageManipulator from 'expo-image-manipulator'
import Screen from '../components/Screen'
import Card from '../components/Card'
import Field from '../components/Field'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { colors, radius } from '../lib/theme'
import { currency } from '../lib/format'
import { totalStock, stockKey } from '../lib/inventory'
import { api } from '../lib/api'

// Deja margen bajo el limite duro de 4.5 MB que Vercel impone al body de una
// funcion serverless (no configurable desde el codigo del backend).
const MAX_PAYLOAD_BYTES = 4 * 1024 * 1024

const dataUrlSize = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') return 0
  const base64 = dataUrl.split(',')[1] || ''
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.floor((base64.length * 3) / 4) - padding
}

const BLANK = { name: '', brand: '', category: '', price: '', availability: 'stock', sizes: '', colors: [], stock: {}, image: '', description: '', hidden: false }

export default function ProductsScreen() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState(null) // producto en edicion, o {} para uno nuevo

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([api.products.list(), api.categories.list()])
      setProducts(p)
      setCategories(c)
    } catch (err) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const visible = products.filter((p) => `${p.name} ${p.brand}`.toLowerCase().includes(q.toLowerCase()))

  const openNew = () => setEditing({ ...BLANK })
  const openEdit = (p) => setEditing({ ...p, sizes: (p.sizes || []).join(', '), colors: p.colors || [], price: String(p.price) })

  const toggleHidden = async (p) => {
    try {
      await api.products.update(p.id, { ...p, hidden: !p.hidden })
      await load()
    } catch (err) {
      Alert.alert('Error', err.message)
    }
  }

  const remove = (p) => {
    Alert.alert('Eliminar producto', `Eliminar "${p.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.products.remove(p.id)
            await load()
          } catch (err) {
            Alert.alert('Error', err.message)
          }
        },
      },
    ])
  }

  return (
    <Screen onRefresh={load} refreshing={loading}>
      <View style={styles.headRow}>
        <Text style={styles.title}>Productos</Text>
        <Button title="+ Nuevo" onPress={openNew} />
      </View>

      <TextInput
        style={styles.search}
        placeholder="Buscar producto…"
        placeholderTextColor={colors.textMuted}
        value={q}
        onChangeText={setQ}
      />

      {visible.map((p) => (
        <Card key={p.id} style={styles.row}>
          <Pressable onPress={() => openEdit(p)} style={{ flexDirection: 'row', flex: 1, gap: 12, alignItems: 'center' }}>
            {p.image ? <Image source={{ uri: p.image }} style={styles.thumb} /> : <View style={styles.thumb} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.meta}>
                {p.brand} · {p.category}{p.colors?.length > 0 ? ` · ${p.colors.length} colores` : ''}
              </Text>
              <View style={styles.rowBetween}>
                <Text style={styles.price}>{currency(p.price)}</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {p.hidden && <Badge label="Oculto" tone="warning" />}
                  {p.availability === 'stock' ? (
                    <Badge label={`Stock: ${totalStock(p)}`} tone={totalStock(p) > 0 ? 'success' : 'danger'} />
                  ) : (
                    <Badge label="A pedido" tone="warning" />
                  )}
                </View>
              </View>
            </View>
          </Pressable>
          <Pressable onPress={() => toggleHidden(p)} style={{ paddingLeft: 10 }}>
            <Text style={styles.toggleLink}>{p.hidden ? 'Mostrar' : 'Ocultar'}</Text>
          </Pressable>
        </Card>
      ))}

      <ProductFormModal
        visible={!!editing}
        product={editing}
        categories={categories}
        onClose={() => setEditing(null)}
        onSaved={async () => { setEditing(null); await load() }}
        onDelete={editing?.id ? () => { setEditing(null); remove(editing) } : null}
      />
    </Screen>
  )
}

function ProductFormModal({ visible, product, categories, onClose, onSaved, onDelete }) {
  const [form, setForm] = useState(BLANK)
  const [useColors, setUseColors] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setForm(product)
      setUseColors((product.colors || []).length > 0)
    }
  }, [product])

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))
  const sizesArr = (form.sizes || '').split(',').map((s) => s.trim()).filter(Boolean)
  const colorNames = useColors ? (form.colors || []).map((c) => c.name.trim()).filter(Boolean) : []

  const pickImage = async (onPicked) => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) return Alert.alert('Permiso necesario', 'Se necesita acceso a la galeria.')
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'] })
    if (result.canceled) return
    // Vercel rechaza (413) cualquier request de mas de 4.5 MB al backend; una
    // foto de camara sin redimensionar + base64 (+33%) supera eso facil.
    const resized = await ImageManipulator.manipulateAsync(
      result.assets[0].uri,
      [{ resize: { width: 1200 } }],
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    )
    onPicked(`data:image/jpeg;base64,${resized.base64}`)
  }

  const addColor = () => setForm((f) => ({ ...f, colors: [...(f.colors || []), { name: '', image: '' }] }))
  const removeColor = (idx) => setForm((f) => ({ ...f, colors: f.colors.filter((_, i) => i !== idx) }))
  const setColorName = (idx, name) => setForm((f) => ({ ...f, colors: f.colors.map((c, i) => (i === idx ? { ...c, name } : c)) }))
  const setColorImage = (idx, uri) => setForm((f) => ({ ...f, colors: f.colors.map((c, i) => (i === idx ? { ...c, image: uri } : c)) }))

  const setSizeStock = (size, color, v) =>
    setForm((f) => ({ ...f, stock: { ...f.stock, [stockKey(size, color)]: Number(v) || 0 } }))

  const save = async () => {
    setError('')
    if (!form.name?.trim()) return setError('El nombre es obligatorio.')
    if (useColors && (form.colors || []).some((c) => !c.name.trim())) {
      return setError('Todos los colores necesitan un nombre (o quitalos).')
    }
    const imagesWeight = dataUrlSize(form.image) + (useColors ? (form.colors || []).reduce((n, c) => n + dataUrlSize(c.image), 0) : 0)
    if (imagesWeight > MAX_PAYLOAD_BYTES) {
      return setError('Las fotos pesan demasiado en conjunto. Elegi menos colores o fotos mas livianas.')
    }
    setBusy(true)
    try {
      const stock = form.availability === 'stock'
        ? (useColors
          ? sizesArr.reduce((acc, s) => ({
            ...acc,
            ...colorNames.reduce((cacc, c) => ({ ...cacc, [stockKey(s, c)]: Number(form.stock?.[stockKey(s, c)]) || 0 }), {}),
          }), {})
          : sizesArr.reduce((acc, s) => ({ ...acc, [s]: Number(form.stock?.[s]) || 0 }), {}))
        : {}
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        sizes: sizesArr,
        colors: useColors ? form.colors.map((c) => ({ name: c.name.trim(), image: c.image || '' })) : [],
        stock,
      }
      if (form.id) await api.products.update(form.id, payload)
      else await api.products.create(payload)
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <Screen scroll>
        <View style={styles.modalHead}>
          <Text style={styles.title}>{form.id ? 'Editar producto' : 'Nuevo producto'}</Text>
          <Pressable onPress={onClose}><Text style={styles.close}>✕</Text></Pressable>
        </View>

        <Pressable onPress={() => pickImage(set('image'))} style={styles.imagePicker}>
          {form.image ? <Image source={{ uri: form.image }} style={styles.previewImg} /> : <Text style={styles.textMuted}>Tocar para elegir una foto de portada</Text>}
        </Pressable>

        <Field label="Nombre" value={form.name} onChangeText={set('name')} />
        <Field label="Marca (opcional)" value={form.brand} onChangeText={set('brand')} />

        <Text style={styles.fieldLabel}>Categoria</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {categories.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => set('category')(c.name)}
                style={[styles.chip, form.category === c.name && styles.chipActive]}
              >
                <Text style={[styles.chipText, form.category === c.name && styles.chipTextActive]}>{c.name}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <Field label="Precio (ARS)" value={form.price} onChangeText={set('price')} keyboardType="numeric" />

        <Text style={styles.fieldLabel}>Disponibilidad</Text>
        <View style={[styles.filtersRow, { marginBottom: 14 }]}>
          <Pressable onPress={() => set('availability')('stock')} style={[styles.chip, form.availability === 'stock' && styles.chipActive]}>
            <Text style={[styles.chipText, form.availability === 'stock' && styles.chipTextActive]}>En stock</Text>
          </Pressable>
          <Pressable onPress={() => set('availability')('order')} style={[styles.chip, form.availability === 'order' && styles.chipActive]}>
            <Text style={[styles.chipText, form.availability === 'order' && styles.chipTextActive]}>A pedido</Text>
          </Pressable>
        </View>

        <Field label="Talles (separados por coma)" value={form.sizes} onChangeText={set('sizes')} placeholder="38, 39, 40" />

        <View style={styles.switchRow}>
          <Text style={styles.fieldLabel}>Este producto tiene variantes de color</Text>
          <Switch value={useColors} onValueChange={setUseColors} trackColor={{ true: colors.brand600 }} />
        </View>

        {useColors && (
          <View style={{ marginBottom: 8 }}>
            {(form.colors || []).map((c, idx) => (
              <View key={idx} style={styles.colorRow}>
                <Pressable onPress={() => pickImage((uri) => setColorImage(idx, uri))} style={styles.colorThumb}>
                  {c.image ? <Image source={{ uri: c.image }} style={styles.previewImg} /> : <Text style={styles.tinyMuted}>Foto</Text>}
                </Pressable>
                <TextInput
                  style={[styles.stockInput, { flex: 1, textAlign: 'left' }]}
                  placeholder="Nombre del color"
                  placeholderTextColor={colors.textMuted}
                  value={c.name}
                  onChangeText={(v) => setColorName(idx, v)}
                />
                <Pressable onPress={() => removeColor(idx)}><Text style={{ color: colors.danger, fontWeight: '700' }}>Quitar</Text></Pressable>
              </View>
            ))}
            <Button title="+ Agregar color" variant="secondary" onPress={addColor} style={{ marginTop: 4 }} />
          </View>
        )}

        {form.availability === 'stock' && sizesArr.length > 0 && (
          <>
            <Text style={styles.fieldLabel}>Stock por talle{useColors ? ' y color' : ''}</Text>
            {useColors ? (
              colorNames.length === 0 ? (
                <Text style={styles.textMuted}>Agrega al menos un color con nombre para cargar su stock.</Text>
              ) : colorNames.map((c) => (
                <View key={c} style={{ marginBottom: 10 }}>
                  <Text style={[styles.fieldLabel, { marginBottom: 6 }]}>{c}</Text>
                  <View style={styles.stockGrid}>
                    {sizesArr.map((s) => (
                      <View key={s} style={styles.stockItem}>
                        <Text style={styles.stockLabel}>{s}</Text>
                        <TextInput
                          style={styles.stockInput}
                          keyboardType="numeric"
                          value={String(form.stock?.[stockKey(s, c)] ?? 0)}
                          onChangeText={(v) => setSizeStock(s, c, v)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.stockGrid}>
                {sizesArr.map((s) => (
                  <View key={s} style={styles.stockItem}>
                    <Text style={styles.stockLabel}>{s}</Text>
                    <TextInput
                      style={styles.stockInput}
                      keyboardType="numeric"
                      value={String(form.stock?.[s] ?? 0)}
                      onChangeText={(v) => setSizeStock(s, undefined, v)}
                    />
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        <View style={styles.switchRow}>
          <Text style={styles.fieldLabel}>Ocultar del catalogo publico</Text>
          <Switch value={!!form.hidden} onValueChange={set('hidden')} trackColor={{ true: colors.brand600 }} />
        </View>

        <Field label="Descripcion" value={form.description} onChangeText={set('description')} multiline />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title={busy ? 'Guardando…' : 'Guardar'} onPress={save} loading={busy} style={{ marginTop: 8 }} />
        {onDelete && <Button title="Eliminar producto" variant="danger" onPress={onDelete} style={{ marginTop: 12 }} />}
      </Screen>
    </Modal>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  search: {
    borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.pill,
    paddingVertical: 10, paddingHorizontal: 16, marginBottom: 16, color: colors.text, backgroundColor: colors.surface,
  },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'center' },
  thumb: { width: 56, height: 56, borderRadius: radius.sm, backgroundColor: colors.bgMuted },
  name: { fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontWeight: '700', color: colors.text },
  toggleLink: { fontSize: 12, fontWeight: '700', color: colors.brand600 },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  close: { fontSize: 20, color: colors.textSoft, padding: 8 },
  imagePicker: {
    height: 160, borderRadius: radius.md, borderWidth: 2, borderColor: colors.borderStrong, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden',
  },
  previewImg: { width: '100%', height: '100%' },
  textMuted: { color: colors.textMuted },
  tinyMuted: { color: colors.textMuted, fontSize: 10 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 },
  filtersRow: { flexDirection: 'row', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.brand600, borderColor: colors.brand600 },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  chipTextActive: { color: colors.textInvert },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  colorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  colorThumb: {
    width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.bgMuted,
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: colors.border,
  },
  stockGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  stockItem: { width: 70 },
  stockLabel: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4 },
  stockInput: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.sm, padding: 8, textAlign: 'center', color: colors.text },
  error: { color: colors.danger, marginBottom: 8 },
})
