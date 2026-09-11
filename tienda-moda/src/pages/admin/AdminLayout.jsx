import { NavLink, Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div className="page">
      <div className="container">
        <div className="section-head" style={{ marginBottom: 'var(--space-6)' }}>
          <span className="eyebrow">Panel de administracion</span>
          <h1 className="section-title">Gestion de AD Moda & Confort</h1>
        </div>

        <div className="admin">
          <nav className="admin__nav card card--pad" style={{ alignSelf: 'start' }}>
            <NavLink end to="/admin" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              Productos
            </NavLink>
            <NavLink to="/admin/producto/nuevo" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              Nuevo producto
            </NavLink>
            <NavLink to="/admin/usuarios" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              Usuarios
            </NavLink>
            <NavLink to="/admin/reservas" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              Reservas
            </NavLink>
            <NavLink to="/admin/reportes" className={({ isActive }) => (isActive ? 'is-active' : '')}>
              Reporte de ventas
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
