import { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native'
import Screen from '../components/Screen'
import Card from '../components/Card'
import Badge from '../components/Badge'
import Button from '../components/Button'
import { colors, radius } from '../lib/theme'
import { currency, formatDate } from '../lib/format'
import { ORDER_STATUSES, statusMeta, statusLabel } from '../lib/orders'
import { api } from '../lib/api'

const FILTERS = [{ value: 'all', label: 'Todas' }, ...ORDER_STATUSES]

export default function OrdersScreen() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    try {
      setError('')
      setOrders(await api.orders.list())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const visible = filter === 'all' ? orders : orders.filter((o) => o.status === filter)

  const changeStatus = async (order, status) => {
    try {
      await api.orders.setStatus(order.id, status)
      await load()
      setSelected((s) => (s ? { ...s, status } : s))
    } catch (err) {
      Alert.alert('Error', err.message)
    }
  }

  const removeOrder = (order) => {
    Alert.alert('Eliminar reserva', `Eliminar la reserva ${order.id}? Esta accion no se puede deshacer.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.orders.remove(order.id)
            setSelected(null)
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
      <Text style={styles.title}>Reservas</Text>

      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setFilter(f.value)}
            style={[styles.chip, filter === f.value && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === f.value && styles.chipTextActive]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {visible.map((o) => (
        <Pressable key={o.id} onPress={() => setSelected(o)}>
          <Card style={styles.orderCard}>
            <View style={styles.orderRow}>
              <Text style={styles.orderId}>{o.id}</Text>
              <Badge label={statusLabel(o)} tone={statusMeta(o.status).color} />
            </View>
            <Text style={styles.orderCustomer}>{o.customer?.name || 'Sin nombre'}</Text>
            <View style={styles.orderRow}>
              <Text style={styles.orderMeta}>{formatDate(o.createdAt)} · {o.fulfillment === 'pickup' ? 'Retiro' : 'Envio'}</Text>
              <Text style={styles.orderTotal}>{currency(o.subtotal)}</Text>
            </View>
          </Card>
        </Pressable>
      ))}

      {!loading && visible.length === 0 && <Text style={styles.empty}>No hay reservas en este filtro.</Text>}

      <Modal visible={!!selected} animationType="slide" onRequestClose={() => setSelected(null)}>
        {selected && (
          <Screen scroll>
            <View style={styles.modalHead}>
              <Text style={styles.title}>{selected.id}</Text>
              <Pressable onPress={() => setSelected(null)}><Text style={styles.close}>✕</Text></Pressable>
            </View>

            <Text style={styles.sectionLabel}>Cliente</Text>
            <Card style={{ marginBottom: 16 }}>
              <Text style={styles.customerName}>{selected.customer?.name}</Text>
              <Text style={styles.orderMeta}>{selected.customer?.email}</Text>
              <Text style={styles.orderMeta}>{selected.customer?.phone}</Text>
              {selected.fulfillment === 'shipping' && (
                <Text style={styles.orderMeta}>{selected.customer?.address}</Text>
              )}
            </Card>

            <Text style={styles.sectionLabel}>Productos</Text>
            <Card style={{ marginBottom: 16 }}>
              {(selected.items || []).map((it, idx) => (
                <View key={idx} style={styles.itemRow}>
                  <Text style={styles.itemText}>{it.qty}× {it.name} (talle {it.size})</Text>
                  <Text style={styles.itemText}>{currency(it.price * it.qty)}</Text>
                </View>
              ))}
              <View style={[styles.itemRow, { marginTop: 8 }]}>
                <Text style={styles.itemTotal}>Subtotal</Text>
                <Text style={styles.itemTotal}>{currency(selected.subtotal)}</Text>
              </View>
            </Card>

            <Text style={styles.sectionLabel}>Estado</Text>
            <View style={styles.filters}>
              {ORDER_STATUSES.map((s) => (
                <Pressable
                  key={s.value}
                  onPress={() => changeStatus(selected, s.value)}
                  style={[styles.chip, selected.status === s.value && styles.chipActive]}
                >
                  <Text style={[styles.chipText, selected.status === s.value && styles.chipTextActive]}>{s.label}</Text>
                </Pressable>
              ))}
            </View>

            <Button title="Eliminar reserva" variant="danger" onPress={() => removeOrder(selected)} style={{ marginTop: 24 }} />
          </Screen>
        )}
      </Modal>
    </Screen>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 16 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.brand600, borderColor: colors.brand600 },
  chipText: { fontSize: 13, fontWeight: '600', color: colors.text },
  chipTextActive: { color: colors.textInvert },
  orderCard: { marginBottom: 12, gap: 6 },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontWeight: '700', color: colors.text },
  orderCustomer: { color: colors.textSoft, fontSize: 14 },
  orderMeta: { color: colors.textMuted, fontSize: 12 },
  orderTotal: { fontWeight: '700', color: colors.text },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 24 },
  error: { color: colors.danger, marginBottom: 12 },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  close: { fontSize: 20, color: colors.textSoft, padding: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textSoft, marginBottom: 8, textTransform: 'uppercase' },
  customerName: { fontWeight: '700', color: colors.text, marginBottom: 4 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemText: { fontSize: 14, color: colors.text, flexShrink: 1 },
  itemTotal: { fontWeight: '700', color: colors.text },
})
