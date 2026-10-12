import { useState } from 'react';
import Field from './Field';
import Notice from './Notice';

const EMPTY = { name: '', username: '', email: '', membershipId: '', role: 'user', password: '' };

export default function UserForm({ initial, onSubmit, onCancel, isSelf }) {
  const isEdit = Boolean(initial);
  const [values, setValues] = useState(initial ? { ...initial, password: '' } : EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  const change = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const result = await onSubmit(values);
    setBusy(false);
    if (result.ok) {
      setErrors({});
      setFormError('');
      if (!isEdit) setValues(EMPTY);
    } else {
      setErrors(result.errors || {});
      setFormError(result.error || '');
    }
  };

  return (
    <form
      className="card border-0 shadow-sm mb-4"
      style={{ borderRadius: 16 }}
      onSubmit={submit}
      noValidate
    >
      <div className="card-body p-4">
        <h2 className="h5 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          {isEdit ? 'Update user' : 'Add a new user'}
        </h2>
        <Notice kind="error">{formError}</Notice>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <Field label="Full name" name="name" value={values.name} onChange={change} error={errors.name} maxLength={60} />
          </div>
          <div className="col-12 col-md-6">
            <Field label="Username" name="username" value={values.username} onChange={change} error={errors.username} maxLength={20} autoComplete="off" />
          </div>
          <div className="col-12 col-md-6">
            <Field label="Email" name="email" type="email" value={values.email} onChange={change} error={errors.email} maxLength={100} />
          </div>
          <div className="col-12 col-md-6">
            <Field label="Membership ID" name="membershipId" value={values.membershipId} onChange={change} error={errors.membershipId} maxLength={20} />
          </div>
          <div className="col-12 col-md-6">
            <Field label="Role" as="select" name="role" value={values.role} onChange={change} error={errors.role} disabled={isSelf}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </Field>
          </div>
          <div className="col-12 col-md-6">
            <Field
              label={isEdit ? 'New password' : 'Password'}
              name="password"
              type="password"
              value={values.password}
              onChange={change}
              error={errors.password}
              hint={isEdit ? 'Leave blank to keep the current password.' : 'At least 8 characters, with a letter and a number.'}
              autoComplete="new-password"
              maxLength={64}
            />
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mt-4">
          <button
            className="btn"
            type="submit"
            disabled={busy}
            style={{
              background: '#000',
              color: '#fff',
              border: '2px solid #000',
              borderRadius: 999,
              padding: '.6rem 1.4rem',
              fontWeight: 600,
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? 'Saving...' : isEdit ? 'Save changes' : 'Add user'}
          </button>
          {isEdit && (
            <button
              className="btn"
              type="button"
              onClick={onCancel}
              style={{
                background: '#fff',
                color: '#000',
                border: '2px solid #000',
                borderRadius: 999,
                padding: '.6rem 1.4rem',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}