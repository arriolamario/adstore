import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const saved = localStorage.getItem('adstore_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (data) => {
    localStorage.setItem('adstore_user', JSON.stringify(data));
    setUsuario(data);
  };

  const actualizarPerfil = (datos) => {
    const actualizado = { ...usuario, ...datos };
    localStorage.setItem('adstore_user', JSON.stringify(actualizado));
    setUsuario(actualizado);
  };

  const logout = () => {
    localStorage.removeItem('adstore_user');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, login, logout, actualizarPerfil }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}