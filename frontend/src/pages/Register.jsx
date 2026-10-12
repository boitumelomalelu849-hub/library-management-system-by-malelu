import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from './AuthShell';
import Field from '../components/Field';
import Notice from '../components/Notice';
import { registerUser } from '../utils/auth';
import { SECURITY_QUESTIONS } from '../utils/security';
import usePageTitle from '../hooks/usePageTitle';

const EMPTY = { name: '', username: '', email: '', password: '', confirm: '', question: '', answer: '' };

export default function Register() {
  usePageTitle('Create account');
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const change = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const result = await registerUser(form);
    setBusy(false);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    navigate('/login', { replace: true, state: { message: 'Account created. You can sign in now.' } });
  };

  return (
    <AuthShell
      title="Create an account"
      subtitle="Join the library to see what is on the shelves."
      footer={
        <span>
          Already have an account? <Link to="/login">Sign in</Link>
        </span>
      }
    >
      <Notice kind="error">{Object.values(errors).some(Boolean) ? 'Fix the highlighted fields and try again.' : ''}</Notice>
      <form onSubmit={submit} noValidate>
        <Field label="Full name" name="name" value={form.name} onChange={change} error={errors.name} autoComplete="name" maxLength={60} />
        <Field label="Username" name="username" value={form.username} onChange={change} error={errors.username} autoComplete="username" maxLength={20} hint="3 to 20 letters, numbers or underscores" />
        <Field label="Email" name="email" type="email" value={form.email} onChange={change} error={errors.email} autoComplete="email" maxLength={100} />
        <Field label="Password" name="password" type="password" value={form.password} onChange={change} error={errors.password} autoComplete="new-password" maxLength={64} hint="At least 8 characters, with a letter and a number" />
        <Field label="Confirm password" name="confirm" type="password" value={form.confirm} onChange={change} error={errors.confirm} autoComplete="new-password" maxLength={64} />
        <Field label="Security question" as="select" name="question" value={form.question} onChange={change} error={errors.question}>
          <option value="">Choose a question</option>
          {SECURITY_QUESTIONS.map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </Field>
        <Field label="Answer" name="answer" value={form.answer} onChange={change} error={errors.answer} maxLength={60} autoComplete="off" hint="Used to reset your password if you forget it" />
        <button className="auth-btn" type="submit" disabled={busy}>
          {busy ? 'Creating account...' : 'Create account'}
        </button>
      </form>
    </AuthShell>
  );
}