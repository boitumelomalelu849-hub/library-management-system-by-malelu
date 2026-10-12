import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute, { GuestRoute } from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import BookManagement from './pages/BookManagement';
import Transactions from './pages/Transactions';
import UserManagement from './pages/UserManagement';
import { homeFor } from './utils/auth';

export default function App() {
  const { user, ready } = useAuth();
  if (!ready) return <p className="loading">Loading...</p>;

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? homeFor(user) : '/login'} replace />} />

      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/books" element={<BookManagement />} />
          <Route path="/admin/transactions" element={<Transactions />} />
          <Route path="/admin/users" element={<UserManagement />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['user']} />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<UserDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
