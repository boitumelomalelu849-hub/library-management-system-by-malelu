import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeFor } from '../utils/auth';

// Authentication: must be signed in. Authorisation: role must be allowed.
export default function ProtectedRoute({ roles }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user)} replace />;
  return <Outlet />;
}

// Login, register and reset pages are only for people who are not signed in.
export function GuestRoute() {
  const { user } = useAuth();
  return user ? <Navigate to={homeFor(user)} replace /> : <Outlet />;
}
