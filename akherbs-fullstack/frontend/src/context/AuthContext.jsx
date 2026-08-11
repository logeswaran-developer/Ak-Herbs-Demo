import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// Holds the logged-in session — either a customer ("user") or an admin.
// Persists { token, role, profile } in localStorage so refreshes keep you logged in.
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem('ak_session');
    if (raw) {
      try { setSession(JSON.parse(raw)); } catch { /* ignore corrupt data */ }
    }
    setLoading(false);
  }, []);

  function persist(next) {
    setSession(next);
    if (next) {
      localStorage.setItem('ak_session', JSON.stringify(next));
      localStorage.setItem('ak_token', next.token);
    } else {
      localStorage.removeItem('ak_session');
      localStorage.removeItem('ak_token');
    }
  }

  async function loginUser(email, password) {
    const { data } = await api.post('/auth/login', { email, password });
    persist({ role: 'user', token: data.token, profile: data.user });
  }

  async function registerUser(payload) {
    const { data } = await api.post('/auth/register', payload);
    persist({ role: 'user', token: data.token, profile: data.user });
  }

  async function loginAdmin(email, password) {
    const { data } = await api.post('/admin/login', { email, password });
    persist({ role: 'admin', token: data.token, profile: data.admin });
  }

  async function registerAdmin(payload) {
    const { data } = await api.post('/admin/register', payload);
    persist({ role: 'admin', token: data.token, profile: data.admin });
  }

  function logout() {
    persist(null);
  }

  const value = { session, loading, loginUser, registerUser, loginAdmin, registerAdmin, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
