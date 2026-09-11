import { useState } from 'react'
import { NavLink, Link } from 'react-router-dom'
import Button from '../ui/Button'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'

const links = [
  { to: '/catalogo', label: 'Catalogo' },
  { to: '/#como-funciona', label: 'Como funciona' },
  { to: '/#local', label: 'Local' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { count, openDrawer } = useCart()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link to="/" className="navbar__brand" onClick={() => setOpen(false)}>
          <span className="navbar__logo">A</span>
          <span>AdStore</span>
        </Link>

        <nav className="navbar__links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'is-active' : '')}>
              {l.label}
            </NavLink>
          ))}
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
        </nav>

        <div className="navbar__actions">
          <button className="navbar__cart" onClick={openDrawer} aria-label="Abrir carrito">
            🛒
            {count > 0 && <span className="navbar__count">{count}</span>}
          </button>

          {isAuthenticated ? (
            <>
              <Link to="/cuenta" className="btn btn--ghost btn--sm">{user?.name?.split(' ')[0] || 'Mi cuenta'}</Link>
              <button className="btn btn--secondary btn--sm" onClick={logout}>Salir</button>
            </>
          ) : (
            <>
              <Button to="/ingresar" variant="ghost" size="sm">Ingresar</Button>
              <Button to="/registro" size="sm">Crear cuenta</Button>
            </>
          )}

          <button className="navbar__burger" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <div className="navbar__mobile">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
          {isAdmin && <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>}
          {isAuthenticated && <Link to="/cuenta" onClick={() => setOpen(false)}>Mi cuenta</Link>}
        </div>
      )}
    </header>
  )
}
