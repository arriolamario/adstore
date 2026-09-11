import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CartDrawer from './components/cart/CartDrawer'
import ProtectedRoute from './components/ProtectedRoute'

import HomePage from './pages/HomePage'
import CatalogPage from './pages/CatalogPage'
import ProductPage from './pages/ProductPage'
import CheckoutPage from './pages/CheckoutPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

import AccountLayout from './pages/account/AccountLayout'
import OrdersPage from './pages/account/OrdersPage'
import ProfilePage from './pages/account/ProfilePage'

import AdminLayout from './pages/admin/AdminLayout'
import AdminProducts from './pages/admin/AdminProducts'
import AdminProductForm from './pages/admin/AdminProductForm'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUserForm from './pages/admin/AdminUserForm'
import AdminOrders from './pages/admin/AdminOrders'
import AdminReports from './pages/admin/AdminReports'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <CartDrawer />

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogPage />} />
          <Route path="/producto/:id" element={<ProductPage />} />
          <Route path="/ingresar" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />

          <Route
            path="/checkout"
            element={<ProtectedRoute redirectTo="/registro"><CheckoutPage /></ProtectedRoute>}
          />

          <Route
            path="/cuenta"
            element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}
          >
            <Route index element={<OrdersPage />} />
            <Route path="pedidos" element={<OrdersPage />} />
            <Route path="perfil" element={<ProfilePage />} />
          </Route>

          <Route
            path="/admin"
            element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}
          >
            <Route index element={<AdminProducts />} />
            <Route path="producto/nuevo" element={<AdminProductForm />} />
            <Route path="producto/:id" element={<AdminProductForm />} />
            <Route path="usuarios" element={<AdminUsers />} />
            <Route path="usuario/nuevo" element={<AdminUserForm />} />
            <Route path="usuario/:id" element={<AdminUserForm />} />
            <Route path="reservas" element={<AdminOrders />} />
            <Route path="reportes" element={<AdminReports />} />
          </Route>

          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <Footer />
    </>
  )
}
