import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import './App.css';
import ProductoDetalle from './pages/ProductoDetalle';
import MisPedidos from './pages/MisPedidos';
import MiPerfil from './pages/MiPerfil';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/producto/:id" element={<ProductoDetalle />} />
        <Route path="/mis-pedidos" element={<MisPedidos />} />
        <Route path="/mi-perfil" element={<MiPerfil />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;