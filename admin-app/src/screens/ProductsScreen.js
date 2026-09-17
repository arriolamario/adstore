import { useCallback, useEffect, useState } from 'react'
import { Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import Screen from '../components/Screen'
import Card from '../components/Card'
import Field from '../components/Field'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { colors, radius } from '../lib/theme'
import { currency } from '../lib/format'
import { totalStock } from '../lib/inventory'
import { api } from '../lib/api'

const BLANK = { name: '', brand: '', category: '', price: '', availability: 'stock', sizes: '', stock: {}, image: '', description: '' }

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
  const openEdit = (p) => setEditing({ ...p, sizes: (p.sizes || []).join(', '), price: String(p.price) })

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
        <Pressable key={p.id} onPress={() => openEdit(p)}>
          <Card style={styles.row}>
            {p.image ? <Image source={{ uri: p.image }} style={styles.thumb} /> : <View style={styles.thumb} />}
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.meta}>{p.brand} · {p.category}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.price}>{currency(p.price)}</Text>
                {p.availability === 'stock' ? (
                  <Badge label={`Stock: ${totalStock(p)}`} tone={totalStock(p) > 0 ? 'success' : 'danger'} />
                ) : (
                  <Badge label="A pedido" tone="warning" />
                )}
              </View>
            </View>
          </Card>
        </Pressable>
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
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (product) setForm(product) }, [product])

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))
  const sizesArr = (form.sizes || '').split(',').map((s) => s.trim()).filter(Boolean)

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) return Alert.alert('Permiso necesario', 'Se necesita acceso a la galeria.')
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      base64: true,
      quality: 0.6,
    })
    if (result.canceled) return
    const asset = result.assets[0]
    set('image')(`data:image/jpeg;base64,${asset.base64}`)
  }

  const save = async () => {
    setError('')
    if (!form.name?.trim()) return setError('El nombre es obligatorio.')
    setBusy(true)
    try {
      const stock = form.availability === 'stock'
        ? sizesArr.reduce((acc, s) => ({ ...acc, [s]: Number(form.stock?.[s]) || 0 }), {})
        : {}
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        sizes: sizesArr,
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

        <Pressable onPress={pickImage} style={styles.imagePicker}>
          {form.image ? <Image source={{ uri: form.image }} style={styles.previewImg} /> : <Text style={styles.textMuted}>Tocar para elegir una foto</Text>}
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

        {form.availability === 'stock' && sizesArr.length > 0 && (
          <>
            <Text style={styles.fieldLabel}>Stock por talle</Text>
            <View style={styles.stockGrid}>
              {sizesArr.map((s) => (
                <View key={s} style={styles.stockItem}>
                  <Text style={styles.stockLabel}>{s}</Text>
                  <TextInput
                    style={styles.stockInput}
                    keyboardType="numeric"
                    value={String(form.stock?.[s] ?? 0)}
                    onChangeText={(v) => set('stock')({ ...form.stock, [s]: Number(v) || 0 })}
                  />
                </View>
              ))}
            </View>
          </>
        )}

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
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  close: { fontSize: 20, color: colors.textSoft, padding: 8 },
  imagePicker: {
    height: 160, borderRadius: radius.md, borderWidth: 2, borderColor: colors.borderStrong, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16, overflow: 'hidden',
  },
  previewImg: { width: '100%', height: '100%' },
  textMuted: { color: colors.textMuted },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 },
  filtersRow: { flexDirection: 'row', gap: 8 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.brand600, borderColor: colors.brand600 },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  chipTextActive: { color: colors.textInvert },
  stockGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  stockItem: { width: 70 },
  stockLabel: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4 },
  stockInput: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.sm, padding: 8, textAlign: 'center', color: colors.text },
  error: { color: colors.danger, marginBottom: 8 },
})
