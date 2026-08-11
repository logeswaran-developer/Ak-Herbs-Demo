import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards a route so only a logged-in admin can view it
export default function AdminRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session || session.role !== 'admin') return <Navigate to="/admin-login" replace />;
  return children;
}
