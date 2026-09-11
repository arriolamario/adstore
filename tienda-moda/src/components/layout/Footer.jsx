import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div>
            <div className="navbar__brand" style={{ marginBottom: 'var(--space-3)' }}>
              <img className="navbar__logo" src="/logo.jpeg" alt="" />
              <span>AdStore</span>
            </div>
            <p className="text-soft" style={{ fontSize: 'var(--fs-sm)', maxWidth: '32ch' }}>
              Calzado y ropa seleccionada. Reserva online y recibi en tu casa o retira por el local.
            </p>
          </div>

          <div>
            <h4>Tienda</h4>
            <Link to="/catalogo">Catalogo completo</Link>
            <Link to="/catalogo?filtro=stock">Entrega inmediata</Link>
            <Link to="/catalogo?filtro=order">Productos a pedido</Link>
          </div>

          <div>
            <h4>Cuenta</h4>
            <Link to="/ingresar">Ingresar</Link>
            <Link to="/registro">Crear cuenta</Link>
            <Link to="/cuenta/pedidos">Mis pedidos</Link>
          </div>

          <div>
            <h4>Local</h4>
            <a href="#local">Av. Siempre Viva 1234</a>
            <a href="#local">Lun a Sab · 10 a 19 h</a>
            <a href="mailto:hola@adstore.com">hola@adstore.com</a>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} AdStore. Todos los derechos reservados.</span>
          <span>Hecho con React + Vite</span>
        </div>
      </div>
    </footer>
  )
}
