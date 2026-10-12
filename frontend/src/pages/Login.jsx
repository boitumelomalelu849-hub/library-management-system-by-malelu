import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';
import Field from '../components/Field';
import Notice from '../components/Notice';
import DemoAccounts from '../components/DemoAccounts';
import { useAuth } from '../context/AuthContext';
import { homeFor } from '../utils/auth';
import usePageTitle from '../hooks/usePageTitle';

const ROLE_NOTES = {
  user: 'See which books are available and review your borrowing.',
  admin: 'Manage books, stock, transactions and members.',
};

const DEMO_ACCOUNTS = [
  { role: 'admin', label: 'Librarian', username: 'admin2026', password: '202601' },
  { role: 'user', label: 'Member', username: 'demo', password: 'Demo1234' },
];

export default function Login() {
  usePageTitle('Sign in');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ role: 'user', username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);

  const change = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
    setFormError('');
  };

  const fillDemo = (account) => {
    setForm({ role: account.role, username: account.username, password: account.password });
    setErrors({});
    setFormError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {
      username: form.username.trim() ? '' : 'Enter your username.',
      password: form.password ? '' : 'Enter your password.',
    };
    if (next.username || next.password) {
      setErrors(next);
      setShake(true);
      return;
    }
    setBusy(true);
    const result = await login(form);
    setBusy(false);
    if (!result.ok) {
      setFormError(result.error);
      setForm((f) => ({ ...f, password: '' }));
      setShake(true);
      return;
    }
    const from = location.state?.from;
    const allowed = result.user.role === 'admin' ? from?.startsWith('/admin') : from === '/dashboard';
    navigate(allowed ? from : homeFor(result.user), { replace: true });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your library account."
      footer={
        <>
          New member? <Link to="/register">Create an account</Link>
        </>
      }
      below={<DemoAccounts accounts={DEMO_ACCOUNTS} activeUsername={form.username} onUse={fillDemo} />}
    >
      <Notice kind="success">{location.state?.message}</Notice>
      <Notice kind="error">{formError}</Notice>

      <form onSubmit={submit} noValidate className={shake ? 'shake' : ''} onAnimationEnd={() => setShake(false)}>
        <fieldset className="border-0 p-0 m-0 mb-1">
          <legend className="form-label">Sign in as</legend>
          <div className="role-switch" data-role={form.role}>
            <label>
              <input type="radio" name="role" value="user" checked={form.role === 'user'} onChange={change} />
              <span>User</span>
            </label>
            <label>
              <input type="radio" name="role" value="admin" checked={form.role === 'admin'} onChange={change} />
              <span>Admin</span>
            </label>
          </div>
        </fieldset>
        <p className="role-note" aria-live="polite">{ROLE_NOTES[form.role]}</p>

        <Field label="Username" name="username" value={form.username} onChange={change} error={errors.username} autoComplete="username" maxLength={20} autoFocus />
        <Field label="Password" name="password" type="password" value={form.password} onChange={change} error={errors.password} autoComplete="current-password" maxLength={64} />
        <Link className="forgot-link" to="/forgot-password">Forgot your password?</Link>

        <button className="auth-btn" type="submit" disabled={busy}>
          {busy && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true" />}
          {busy ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </AuthShell>
  );
}