import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const agregar = (producto, talle) => {
    setItems(prev => {
      const existe = prev.find(i => i.productoTalleId === talle.id);
      if (existe) {
        return prev.map(i =>
          i.productoTalleId === talle.id
            ? { ...i, cantidad: i.cantidad + 1 }
            : i
        );
      }
      return [...prev, {
        productoTalleId: talle.id,
        productoNombre: producto.nombre,
        talle: talle.talle,
        precio: producto.precio,
        stockMax: talle.stock,
        cantidad: 1
      }];
    });
  };

  const quitar = (productoTalleId) => {
    setItems(prev => prev.filter(i => i.productoTalleId !== productoTalleId));
  };

  const cambiarCantidad = (productoTalleId, cantidad) => {
    if (cantidad < 1) return;
    setItems(prev => prev.map(i =>
      i.productoTalleId === productoTalleId ? { ...i, cantidad } : i
    ));
  };

  const vaciar = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, agregar, quitar, cambiarCantidad, vaciar, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}