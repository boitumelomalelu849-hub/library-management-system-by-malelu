import { useState } from 'react';
import Field from './Field';
import Notice from './Notice';

const EMPTY_EXISTING = { bookId: '', type: 'add', quantity: '', memberId: '', note: '' };
const EMPTY_NEW = { title: '', author: '', genre: '', isbn: '', quantity: '', note: '' };

export default function TransactionForm({ books, users, onSubmit, onSubmitNew }) {
  const [mode, setMode] = useState('existing'); // 'existing' | 'new'
  const [existing, setExisting] = useState(EMPTY_EXISTING);
  const [newBook, setNewBook] = useState(EMPTY_NEW);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');

  const changeExisting = (e) => {
    setExisting((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const changeNew = (e) => {
    setNewBook((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: '' }));
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setFormError('');
  };

  const submitExisting = (e) => {
    e.preventDefault();
    const result = onSubmit(existing);
    if (result.ok) {
      setExisting(EMPTY_EXISTING);
      setErrors({});
      setFormError('');
    } else {
      setErrors(result.errors || {});
      setFormError(result.error || '');
    }
  };

  const submitNew = (e) => {
    e.preventDefault();
    const result = onSubmitNew(newBook);
    if (result.ok) {
      setNewBook(EMPTY_NEW);
      setErrors({});
      setFormError('');
    } else {
      setErrors(result.errors || {});
      setFormError(result.error || '');
    }
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: '.55rem 1rem',
    border: '2px solid #000',
    borderRadius: 999,
    fontWeight: 600,
    background: active ? '#000' : '#fff',
    color: active ? '#fff' : '#000',
    cursor: 'pointer',
  });

  return (
    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 16 }}>
      <div className="card-body p-4">
        <h2 className="h5 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          Record a transaction
        </h2>

        <div className="d-flex gap-2 mb-4">
          <button type="button" style={tabStyle(mode === 'existing')} onClick={() => switchMode('existing')}>
            Existing book
          </button>
          <button type="button" style={tabStyle(mode === 'new')} onClick={() => switchMode('new')}>
            New book
          </button>
        </div>

        <Notice kind="error">{formError}</Notice>

        {mode === 'existing' ? (
          <form onSubmit={submitExisting} noValidate>
            <fieldset className="border-0 p-0 mb-3">
              <legend className="form-label fw-semibold small text-uppercase text-muted">
                Transaction type
              </legend>
              <div className="d-flex flex-wrap gap-4">
                <label className="d-flex align-items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="add"
                    checked={existing.type === 'add'}
                    onChange={changeExisting}
                  />
                  <span>Add stock (new books arrived)</span>
                </label>
                <label className="d-flex align-items-center gap-2">
                  <input
                    type="radio"
                    name="type"
                    value="borrow"
                    checked={existing.type === 'borrow'}
                    onChange={changeExisting}
                  />
                  <span>Deduct stock (book borrowed)</span>
                </label>
              </div>
            </fieldset>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <Field label="Book" as="select" name="bookId" value={existing.bookId} onChange={changeExisting} error={errors.bookId}>
                  <option value="">Choose a book</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.quantity} in stock)
                    </option>
                  ))}
                </Field>
              </div>
              <div className="col-12 col-md-6">
                <Field label="Quantity" name="quantity" type="number" min="1" max="9999" value={existing.quantity} onChange={changeExisting} error={errors.quantity} />
              </div>
              {existing.type === 'borrow' && (
                <div className="col-12 col-md-6">
                  <Field label="Member" as="select" name="memberId" value={existing.memberId} onChange={changeExisting} error={errors.memberId}>
                    <option value="">Choose a member</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.membershipId})
                      </option>
                    ))}
                  </Field>
                </div>
              )}
              <div className="col-12">
                <Field label="Note (optional)" name="note" value={existing.note} onChange={changeExisting} maxLength={120} />
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-4">
              <button
                className="btn"
                type="submit"
                style={{ background: '#000', color: '#fff', border: '2px solid #000', borderRadius: 999, padding: '.6rem 1.4rem', fontWeight: 600 }}
              >
                {existing.type === 'add' ? 'Add stock' : 'Deduct stock'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={submitNew} noValidate>
            <p className="text-muted small mb-3">
              Creates the book in the catalogue and records the added stock in one step.
            </p>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <Field label="Title" name="title" value={newBook.title} onChange={changeNew} error={errors.title} maxLength={120} />
              </div>
              <div className="col-12 col-md-6">
                <Field label="Author" name="author" value={newBook.author} onChange={changeNew} error={errors.author} maxLength={80} />
              </div>
              <div className="col-12 col-md-6">
                <Field label="Genre" name="genre" value={newBook.genre} onChange={changeNew} error={errors.genre} maxLength={40} />
              </div>
              <div className="col-12 col-md-6">
                <Field label="ISBN" name="isbn" value={newBook.isbn} onChange={changeNew} error={errors.isbn} hint="10 or 13 digits" maxLength={20} />
              </div>
              <div className="col-12 col-md-6">
                <Field label="Quantity" name="quantity" type="number" min="1" max="9999" value={newBook.quantity} onChange={changeNew} error={errors.quantity} />
              </div>
              <div className="col-12 col-md-6">
                <Field label="Note (optional)" name="note" value={newBook.note} onChange={changeNew} maxLength={120} />
              </div>
            </div>

            <div className="d-flex flex-wrap gap-2 mt-4">
              <button
                className="btn"
                type="submit"
                style={{ background: '#000', color: '#fff', border: '2px solid #000', borderRadius: 999, padding: '.6rem 1.4rem', fontWeight: 600 }}
              >
                Add new stock
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}