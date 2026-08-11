import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const u = localStorage.getItem('user');
    const t = localStorage.getItem('token');
    if (u && t) setUser(JSON.parse(u));
    setLoading(false);
  }, []);
  const login = async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    const d = r.data;
    localStorage.setItem('token', d.token);
    localStorage.setItem('user', JSON.stringify(d));
    setUser(d);
    return d;
  };
  const register = async (data) => {
    const r = await api.post('/auth/registro', data);
    const d = r.data;
    localStorage.setItem('token', d.token);
    localStorage.setItem('user', JSON.stringify(d));
    setUser(d);
    return d;
  };
  const logout = () => { localStorage.clear(); setUser(null); };
  const updateUser = (partial) => {
    setUser(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: () => !!user, hasRole: (r) => user?.tipoUsuario === r }}>
      {children}
    </AuthContext.Provider>
  );
};
