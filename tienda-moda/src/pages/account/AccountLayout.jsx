import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function AccountLayout() {
  const { user } = useAuth()

  return (
    <div className="page">
      <div className="container">
        <div className="section-head" style={{ marginBottom: 'var(--space-6)' }}>
          <span className="eyebrow">Mi cuenta</span>
          <h1 className="section-title">Hola, {user?.name?.split(' ')[0]}</h1>
        </div>

        <div className="account">
          <nav className="account__nav card card--pad" style={{ alignSelf: 'start' }}>
            <NavLink to="/cuenta/pedidos" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              Mis pedidos
            </NavLink>
            <NavLink to="/cuenta/perfil" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              Editar perfil
            </NavLink>
          </nav>
          <div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
