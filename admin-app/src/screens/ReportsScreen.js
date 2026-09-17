import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, StyleSheet, Text, View } from 'react-native'
import Screen from '../components/Screen'
import Card from '../components/Card'
import { colors } from '../lib/theme'
import { currency } from '../lib/format'
import { api } from '../lib/api'

export default function ReportsScreen() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setOrders(await api.orders.list())
    } catch (err) {
      Alert.alert('Error', err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const report = useMemo(() => {
    const active = orders.filter((o) => o.status !== 'cancelado')
    const units = active.reduce((n, o) => n + o.items.reduce((s, i) => s + i.qty, 0), 0)
    const revenue = active.reduce((n, o) => n + o.subtotal, 0)
    const byProduct = {}
    active.forEach((o) => o.items.forEach((i) => {
      byProduct[i.name] = (byProduct[i.name] || 0) + i.qty
    }))
    const top = Object.entries(byProduct).sort((a, b) => b[1] - a[1]).slice(0, 5)
    return { count: active.length, units, revenue, canceled: orders.length - active.length, top }
  }, [orders])

  return (
    <Screen onRefresh={load} refreshing={loading}>
      <Text style={styles.title}>Reporte de ventas</Text>

      <View style={styles.grid}>
        <Stat label="Reservas" value={report.count} />
        <Stat label="Unidades" value={report.units} />
        <Stat label="Ingresos" value={currency(report.revenue)} />
        <Stat label="Canceladas" value={report.canceled} />
      </View>

      <Text style={styles.sectionLabel}>Productos mas reservados</Text>
      <Card>
        {report.top.length === 0 && <Text style={styles.empty}>Sin datos todavia.</Text>}
        {report.top.map(([name, qty]) => (
          <View key={name} style={styles.topRow}>
            <Text style={styles.topName}>{name}</Text>
            <Text style={styles.topQty}>{qty} u.</Text>
          </View>
        ))}
      </Card>
    </Screen>
  )
}

function Stat({ label, value }) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </Card>
  )
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  stat: { width: '47%' },
  statLabel: { fontSize: 12, color: colors.textMuted },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textSoft, marginBottom: 8, textTransform: 'uppercase' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  topName: { color: colors.text, flexShrink: 1 },
  topQty: { color: colors.textSoft, fontWeight: '700' },
  empty: { color: colors.textMuted },
})
