import { useCallback, useEffect, useState } from 'react'
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import Screen from '../components/Screen'
import Card from '../components/Card'
import Field from '../components/Field'
import Button from '../components/Button'
import Badge from '../components/Badge'
import { colors } from '../lib/theme'
import { formatDate } from '../lib/format'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'

const BLANK = { name: '', email: '', phone: '', address: '', password: '', role: 'customer' }

export default function UsersScreen() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)

  const load = useCallback(async () => {
    try {
      setUsers(await api.users.list())
    } catch (err) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const remove = (u) => {
    if (u.id === currentUser.id) return
    Alert.alert('Eliminar usuario', `Eliminar la cuenta de "${u.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.users.remove(u.id)
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
        <Text style={styles.title}>Usuarios</Text>
        <Button title="+ Nuevo" onPress={() => setEditing({ ...BLANK })} />
      </View>

      {users.map((u) => (
        <Pressable key={u.id} onPress={() => setEditing({ ...u, password: '' })}>
          <Card style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{u.name}{u.id === currentUser.id ? ' (vos)' : ''}</Text>
              <Text style={styles.meta}>{u.email}</Text>
              <Text style={styles.meta}>Desde {formatDate(u.createdAt)}</Text>
            </View>
            <Badge label={u.role === 'admin' ? 'Admin' : 'Comprador'} tone={u.role === 'admin' ? 'brand' : 'success'} />
          </Card>
        </Pressable>
      ))}

      <UserFormModal
        visible={!!editing}
        user={editing}
        currentUserId={currentUser.id}
        onClose={() => setEditing(null)}
        onSaved={async () => { setEditing(null); await load() }}
        onDelete={editing?.id && editing.id !== currentUser.id ? () => { setEditing(null); remove(editing) } : null}
      />
    </Screen>
  )
}

function UserFormModal({ visible, user, currentUserId, onClose, onSaved, onDelete }) {
  const [form, setForm] = useState(BLANK)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (user) setForm(user) }, [user])

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }))
  const isNew = !form.id
  const editingSelf = form.id === currentUserId

  const save = async () => {
    setError('')
    if (!form.name?.trim() || !form.email?.trim()) return setError('Nombre y email son obligatorios.')
    if (isNew && (!form.password || form.password.length < 4)) return setError('La contrasena debe tener al menos 4 caracteres.')
    setBusy(true)
    try {
      const payload = { ...form }
      if (!payload.password) delete payload.password
      if (isNew) await api.users.create(payload)
      else await api.users.update(form.id, payload)
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
          <Text style={styles.title}>{isNew ? 'Nuevo usuario' : 'Editar usuario'}</Text>
          <Pressable onPress={onClose}><Text style={styles.close}>✕</Text></Pressable>
        </View>

        <Field label="Nombre y apellido" value={form.name} onChangeText={set('name')} />
        <Field label="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" />
        <Field
          label={isNew ? 'Contrasena' : 'Nueva contrasena (opcional)'}
          value={form.password}
          onChangeText={set('password')}
          secureTextEntry
          placeholder={isNew ? '' : 'Dejar vacio para no cambiarla'}
        />
        <Field label="Telefono" value={form.phone} onChangeText={set('phone')} keyboardType="numeric" />
        <Field label="Direccion" value={form.address} onChangeText={set('address')} />

        {!editingSelf && (
          <>
            <Text style={styles.fieldLabel}>Rol</Text>
            <View style={styles.roleRow}>
              <Pressable onPress={() => set('role')('customer')} style={[styles.chip, form.role === 'customer' && styles.chipActive]}>
                <Text style={[styles.chipText, form.role === 'customer' && styles.chipTextActive]}>Comprador</Text>
              </Pressable>
              <Pressable onPress={() => set('role')('admin')} style={[styles.chip, form.role === 'admin' && styles.chipActive]}>
                <Text style={[styles.chipText, form.role === 'admin' && styles.chipTextActive]}>Admin</Text>
              </Pressable>
            </View>
          </>
        )}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button title={busy ? 'Guardando…' : 'Guardar'} onPress={save} loading={busy} style={{ marginTop: 8 }} />
        {onDelete && <Button title="Eliminar usuario" variant="danger" onPress={onDelete} style={{ marginTop: 12 }} />}
      </Screen>
    </Modal>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, gap: 8 },
  name: { fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.textMuted },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  close: { fontSize: 20, color: colors.textSoft, padding: 8 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: colors.text, marginBottom: 8 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.brand600, borderColor: colors.brand600 },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  chipTextActive: { color: colors.textInvert },
  error: { color: colors.danger, marginBottom: 8 },
})
