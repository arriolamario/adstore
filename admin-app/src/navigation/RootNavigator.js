import { ActivityIndicator, Pressable, Text, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { colors } from '../lib/theme'
import { useAuth } from '../context/AuthContext'
import LoginScreen from '../screens/LoginScreen'
import OrdersScreen from '../screens/OrdersScreen'
import ProductsScreen from '../screens/ProductsScreen'
import CategoriesScreen from '../screens/CategoriesScreen'
import UsersScreen from '../screens/UsersScreen'
import ReportsScreen from '../screens/ReportsScreen'

const Tab = createBottomTabNavigator()

const ICONS = { Reservas: '📋', Productos: '👟', Categorias: '🏷️', Usuarios: '👤', Reportes: '📊' }

function LogoutButton() {
  const { logout } = useAuth()
  return (
    <Pressable onPress={logout} style={{ marginRight: 16 }}>
      <Text style={{ color: colors.brand600, fontWeight: '700' }}>Salir</Text>
    </Pressable>
  )
}

function AdminTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerRight: () => <LogoutButton />,
        headerTitleStyle: { color: colors.text },
        tabBarActiveTintColor: colors.brand600,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: () => <Text style={{ fontSize: 18 }}>{ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Reservas" component={OrdersScreen} />
      <Tab.Screen name="Productos" component={ProductsScreen} />
      <Tab.Screen name="Categorias" component={CategoriesScreen} />
      <Tab.Screen name="Usuarios" component={UsersScreen} />
      <Tab.Screen name="Reportes" component={ReportsScreen} />
    </Tab.Navigator>
  )
}

export default function RootNavigator() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.brand600} size="large" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AdminTabs /> : <LoginScreen />}
    </NavigationContainer>
  )
}
