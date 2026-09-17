import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Screen from '../components/Screen'
import Field from '../components/Field'
import Button from '../components/Button'
import { colors } from '../lib/theme'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    setError('')
    setBusy(true)
    try {
      await login({ email, password })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Screen scroll={false}>
      <View style={styles.center}>
        <Text style={styles.brand}>AD Moda & Confort</Text>
        <Text style={styles.subtitle}>Panel de administracion</Text>

        <View style={styles.form}>
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="admin@adstore.com"
          />
          <Field label="Contrasena" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button title="Ingresar" onPress={submit} loading={busy} disabled={!email || !password} />
        </View>

        <Text style={styles.hint}>Solo cuentas con rol de administrador pueden entrar aca.</Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  brand: { fontSize: 24, fontWeight: '800', color: colors.brand600, textAlign: 'center' },
  subtitle: { fontSize: 14, color: colors.textSoft, textAlign: 'center', marginTop: 4, marginBottom: 32 },
  form: { gap: 4 },
  error: { color: colors.danger, fontSize: 13, marginBottom: 12 },
  hint: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 24 },
})
