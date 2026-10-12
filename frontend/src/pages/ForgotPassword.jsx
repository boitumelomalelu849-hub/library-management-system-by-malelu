import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';
import Field from '../components/Field';
import Notice from '../components/Notice';
import { getResetQuestion, resetPassword } from '../utils/auth';
import usePageTitle from '../hooks/usePageTitle';

export default function ForgotPassword() {
  usePageTitle('Reset password');
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState('');
  const [question, setQuestion] = useState('');
  const [form, setForm] = useState({ answer: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const findAccount = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrors({ username: 'Enter your username.' });
      return;
    }
    const result = getResetQuestion(username);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setFormError('');
    setQuestion(result.question);
    setStep(2);
  };

  const change = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const submitReset = async (e) => {
    e.preventDefault();
    setBusy(true);
    const result = await resetPassword({ username, ...form });
    setBusy(false);
    if (!result.ok) {
      setErrors(result.errors || {});
      setFormError(result.error || '');
      return;
    }
    navigate('/login', { replace: true, state: { message: 'Password updated. Sign in with your new password.' } });
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle={step === 1 ? 'Enter your username to continue.' : 'Answer your security question and choose a new password.'}
      footer={<Link to="/login">Back to sign in</Link>}
    >
      <Notice kind="error">{formError}</Notice>
      {step === 1 ? (
        <form onSubmit={findAccount} noValidate>
          <Field label="Username" value={username} error={errors.username} maxLength={20} autoComplete="username"
            onChange={(e) => { setUsername(e.target.value); setErrors({}); setFormError(''); }} />
          <button className="auth-btn" type="submit">Continue</button>
        </form>
      ) : (
        <form onSubmit={submitReset} noValidate>
          <p className="question">{question}</p>
          <Field label="Your answer" name="answer" value={form.answer} onChange={change} error={errors.answer} maxLength={60} autoComplete="off" />
          <Field label="New password" name="password" type="password" value={form.password} onChange={change} error={errors.password} maxLength={64} autoComplete="new-password" hint="At least 8 characters, with a letter and a number" />
          <Field label="Confirm new password" name="confirm" type="password" value={form.confirm} onChange={change} error={errors.confirm} maxLength={64} autoComplete="new-password" />
          <button className="auth-btn" type="submit" disabled={busy}>
            {busy ? 'Updating...' : 'Update password'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}