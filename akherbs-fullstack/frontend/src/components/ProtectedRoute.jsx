import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards a route so only a logged-in customer (role "user") can view it
export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session || session.role !== 'user') return <Navigate to="/login" replace />;
  return children;
}
