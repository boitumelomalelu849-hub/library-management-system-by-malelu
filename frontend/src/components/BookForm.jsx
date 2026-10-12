import { useState } from 'react';
import Field from './Field';
import Notice from './Notice';

const EMPTY = { title: '', author: '', genre: '', isbn: '', quantity: '' };

// Add or edit a book. onSubmit returns { ok, error, errors }. Use key={...} to reset between books.
export default function BookForm({ initial, onSubmit, onCancel }) {
  const isEdit = Boolean(initial);
  const [values, setValues] = useState(
    initial ? { ...initial, quantity: String(initial.quantity) } : EMPTY
  );
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const change = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const submit = (e) => {
    e.preventDefault();
    const result = onSubmit(values);
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
          {isEdit ? 'Update book' : 'Add a new book'}
        </h2>
        <Notice kind="error">{formError}</Notice>

        <div className="row g-3">
          <div className="col-12 col-md-6">
            <Field label="Title" name="title" value={values.title} onChange={change} error={errors.title} maxLength={120} />
          </div>
          <div className="col-12 col-md-6">
            <Field label="Author" name="author" value={values.author} onChange={change} error={errors.author} maxLength={80} />
          </div>
          <div className="col-12 col-md-6">
            <Field label="Genre" name="genre" value={values.genre} onChange={change} error={errors.genre} maxLength={40} />
          </div>
          <div className="col-12 col-md-6">
            <Field label="ISBN" name="isbn" value={values.isbn} onChange={change} error={errors.isbn} hint="10 or 13 digits" maxLength={20} />
          </div>
          <div className="col-12">
            {isEdit ? (
              <p className="text-muted small mb-0">
                Current stock: <strong className="text-dark">{initial.quantity}</strong>. Change stock on the Transactions page.
              </p>
            ) : (
              <Field label="Initial quantity" name="quantity" type="number" min="0" max="9999" value={values.quantity} onChange={change} error={errors.quantity} />
            )}
          </div>
        </div>

        <div className="d-flex flex-wrap gap-2 mt-4">
          <button
            className="btn"
            type="submit"
            style={{ background: '#000', color: '#fff', border: '2px solid #000', borderRadius: 999, padding: '.6rem 1.4rem', fontWeight: 600 }}
          >
            {isEdit ? 'Save changes' : 'Add book'}
          </button>
          {isEdit && (
            <button
              className="btn"
              type="button"
              onClick={onCancel}
              style={{ background: '#fff', color: '#000', border: '2px solid #000', borderRadius: 999, padding: '.6rem 1.4rem', fontWeight: 600 }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}