import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { colors, radius } from '../lib/theme'

/** Boton generico. variant: 'primary' | 'secondary' | 'ghost' | 'danger'. */
export default function Button({ title, onPress, variant = 'primary', disabled, loading, style }) {
  const bg = {
    primary: colors.brand600,
    secondary: colors.surface,
    ghost: 'transparent',
    danger: colors.dangerBg,
  }[variant]
  const fg = variant === 'primary' ? colors.textInvert : variant === 'danger' ? colors.danger : colors.text
  const border = variant === 'secondary' ? colors.borderStrong : 'transparent'

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={fg} /> : <Text style={[styles.text, { color: fg }]}>{title}</Text>}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontWeight: '700', fontSize: 14 },
})
