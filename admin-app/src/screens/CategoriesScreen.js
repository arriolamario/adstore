import { useCallback, useEffect, useState } from 'react'
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Screen from '../components/Screen'
import Card from '../components/Card'
import Button from '../components/Button'
import { colors, radius } from '../lib/theme'
import { api } from '../lib/api'

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [busy, setBusy] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')

  const load = useCallback(async () => {
    try {
      setCategories(await api.categories.list())
    } catch (err) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const create = async () => {
    const name = newName.trim()
    if (!name) return
    setBusy(true)
    try {
      await api.categories.create({ name })
      setNewName('')
      await load()
    } catch (err) {
      Alert.alert('Error', err.message)
    } finally {
      setBusy(false)
    }
  }

  const saveEdit = async (id) => {
    const name = editValue.trim()
    if (!name) return
    try {
      await api.categories.update(id, { name })
      setEditingId(null)
      await load()
    } catch (err) {
      Alert.alert('Error', err.message)
    }
  }

  const remove = (c) => {
    Alert.alert('Eliminar categoria', `Eliminar "${c.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.categories.remove(c.id)
            await load()
          } catch (err) {
            Alert.alert('No se pudo eliminar', err.message)
          }
        },
      },
    ])
  }

  return (
    <Screen onRefresh={load} refreshing={loading}>
      <Text style={styles.title}>Categorias</Text>

      <View style={styles.newRow}>
        <TextInput
          style={styles.input}
          placeholder="Nueva categoria…"
          placeholderTextColor={colors.textMuted}
          value={newName}
          onChangeText={setNewName}
        />
        <Button title="+" onPress={create} loading={busy} />
      </View>

      {categories.map((c) => (
        <Card key={c.id} style={styles.row}>
          {editingId === c.id ? (
            <TextInput style={[styles.input, { flex: 1 }]} value={editValue} onChangeText={setEditValue} autoFocus />
          ) : (
            <Text style={styles.name}>{c.name}</Text>
          )}
          <View style={styles.actions}>
            {editingId === c.id ? (
              <>
                <Pressable onPress={() => saveEdit(c.id)}><Text style={styles.action}>Guardar</Text></Pressable>
                <Pressable onPress={() => setEditingId(null)}><Text style={styles.action}>Cancelar</Text></Pressable>
              </>
            ) : (
              <>
                <Pressable onPress={() => { setEditingId(c.id); setEditValue(c.name) }}><Text style={styles.action}>Editar</Text></Pressable>
                <Pressable onPress={() => remove(c)}><Text style={[styles.action, { color: colors.danger }]}>Eliminar</Text></Pressable>
              </>
            )}
          </View>
        </Card>
      ))}
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 16 },
  newRow: { flexDirection: 'row', gap: 8, marginBottom: 16, alignItems: 'center' },
  input: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 12, color: colors.text, backgroundColor: colors.surface, flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  name: { fontWeight: '600', color: colors.text, flex: 1 },
  actions: { flexDirection: 'row', gap: 16 },
  action: { fontSize: 13, fontWeight: '700', color: colors.brand600 },
})
