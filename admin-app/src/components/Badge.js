import { StyleSheet, Text, View } from 'react-native'
import { colors, radius } from '../lib/theme'

const tones = {
  brand: { bg: colors.brand50, fg: colors.brand700 },
  success: { bg: colors.successBg, fg: colors.success },
  warning: { bg: colors.warningBg, fg: colors.warning },
  danger: { bg: colors.dangerBg, fg: colors.danger },
  neutral: { bg: colors.bgMuted, fg: colors.textSoft },
}

export default function Badge({ label, tone = 'neutral' }) {
  const { bg, fg } = tones[tone] || tones.neutral
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill, alignSelf: 'flex-start' },
  text: { fontSize: 12, fontWeight: '700' },
})
