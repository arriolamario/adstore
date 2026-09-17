import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from '../lib/theme'

/** Wrapper estandar: safe area + fondo de marca + scroll opcional con pull-to-refresh. */
export default function Screen({ children, scroll = true, onRefresh, refreshing }) {
  const Wrapper = scroll ? ScrollView : View
  const scrollProps = scroll
    ? {
        contentContainerStyle: styles.content,
        refreshControl: onRefresh ? (
          <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.brand600} />
        ) : undefined,
      }
    : { style: styles.content }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Wrapper {...scrollProps}>{children}</Wrapper>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16, flexGrow: 1 },
})
