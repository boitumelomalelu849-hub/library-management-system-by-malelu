import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useLibraryData from '../hooks/useLibraryData';
import usePageTitle from '../hooks/usePageTitle';
import BookAvailability from '../components/BookAvailability';
import TransactionLog from '../components/TransactionLog';
import Notice from '../components/Notice';
import {
  borrowBook,
  returnBook,
  myOpenBorrows,
  activeBorrowCount,
  MAX_ACTIVE_BORROWS,
} from '../utils/library';

export default function UserDashboard() {
  usePageTitle('My dashboard');
  const { user } = useAuth();
  const { books, transactions, refresh } = useLibraryData();
  const [notice, setNotice] = useState({ kind: 'success', text: '' });

  const openBorrows = useMemo(() => myOpenBorrows(user.id), [transactions, user.id]);
  const activeCount = useMemo(() => activeBorrowCount(user.id), [transactions, user.id]);

  const available = books.filter((b) => b.quantity > 0);
  const [borrowForm, setBorrowForm] = useState({ bookId: '', quantity: '1' });
  const [borrowErrors, setBorrowErrors] = useState({});

  const submitBorrow = (e) => {
    e.preventDefault();
    const result = borrowBook(user, borrowForm);
    if (result.ok) {
      setBorrowForm({ bookId: '', quantity: '1' });
      setBorrowErrors({});
      setNotice({ kind: 'success', text: 'Book borrowed. The librarian sees this immediately.' });
      refresh();
    } else {
      setBorrowErrors(result.errors || {});
      setNotice({ kind: 'error', text: result.error || 'Could not complete the borrow.' });
    }
  };

  const handleReturn = (borrowId, remaining) => {
    if (!window.confirm(`Return ${remaining} copy(ies) of this book?`)) return;
    const result = returnBook(user, { borrowId, quantity: remaining });
    if (result.ok) {
      setNotice({ kind: 'success', text: 'Book returned. Stock updated.' });
      refresh();
    } else {
      setNotice({ kind: 'error', text: result.error });
    }
  };

  const myHistory = transactions.filter((t) => t.memberId === user.id);

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3">
        <div>
          <h1 className="h2 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            My dashboard
          </h1>
          <p className="text-muted mb-0">
            Signed in as <strong className="text-dark">{user.username}</strong>
          </p>
        </div>
        <span
          style={{
            background: '#000',
            color: '#fff',
            padding: '.4rem 1rem',
            borderRadius: 999,
            fontSize: '.85rem',
            fontWeight: 600,
          }}
        >
          {activeCount} / {MAX_ACTIVE_BORROWS} books out
        </span>
      </div>

      <Notice kind={notice.kind}>{notice.text}</Notice>

      <section className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
        <div className="card-body p-4">
          <h2 className="h5 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Your details
          </h2>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              <div className="text-muted small text-uppercase fw-semibold">Name</div>
              <div className="fw-semibold">{user.name}</div>
            </div>
            <div className="col-12 col-md-4">
              <div className="text-muted small text-uppercase fw-semibold">Membership ID</div>
              <div className="fw-semibold">{user.membershipId}</div>
            </div>
            <div className="col-12 col-md-4">
              <div className="text-muted small text-uppercase fw-semibold">Email</div>
              <div className="fw-semibold">{user.email}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
        <div className="card-body p-4">
          <h2 className="h5 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Borrow a book
          </h2>

          {activeCount >= MAX_ACTIVE_BORROWS ? (
            <div className="alert alert-dark border-0 mb-0" style={{ borderRadius: 10 }}>
              You already have {MAX_ACTIVE_BORROWS} books out. Return one before borrowing another.
            </div>
          ) : available.length === 0 ? (
            <p className="text-muted mb-0">No books are currently available to borrow.</p>
          ) : (
            <form className="row g-3 align-items-end" onSubmit={submitBorrow} noValidate>
              <div className="col-12 col-md-7">
                <label className="form-label small fw-semibold text-uppercase text-muted">Book</label>
                <select
                  className="form-select"
                  value={borrowForm.bookId}
                  onChange={(e) => setBorrowForm((f) => ({ ...f, bookId: e.target.value }))}
                  style={{ borderRadius: 999, padding: '.6rem 1.1rem' }}
                >
                  <option value="">Choose a book</option>
                  {available.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} — {b.author} ({b.quantity} in stock)
                    </option>
                  ))}
                </select>
                {borrowErrors.bookId && <p className="text-danger small mb-0 mt-1">{borrowErrors.bookId}</p>}
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label small fw-semibold text-uppercase text-muted">Qty</label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  max="5"
                  value={borrowForm.quantity}
                  onChange={(e) => setBorrowForm((f) => ({ ...f, quantity: e.target.value }))}
                  style={{ borderRadius: 999, padding: '.6rem 1.1rem' }}
                />
                {borrowErrors.quantity && <p className="text-danger small mb-0 mt-1">{borrowErrors.quantity}</p>}
              </div>
              <div className="col-6 col-md-3">
                <button
                  type="submit"
                  className="btn w-100"
                  style={{
                    background: '#000',
                    color: '#fff',
                    border: '2px solid #000',
                    borderRadius: 999,
                    padding: '.6rem 1.2rem',
                    fontWeight: 600,
                  }}
                >
                  Borrow
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section>
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
          <h2 className="h4 mb-0" style={{ fontFamily: 'Georgia, serif' }}>
            Currently borrowed
          </h2>
          <span className="text-muted small">
            {openBorrows.length === 0 ? 'Nothing out right now' : `${openBorrows.length} active borrow(s)`}
          </span>
        </div>

        {openBorrows.length === 0 ? (
          <div className="card border-0 shadow-sm" style={{ borderRadius: 16 }}>
            <div className="card-body p-4 text-center text-muted">
              You have no books borrowed at the moment.
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: '#000', color: '#fff' }}>
                  <tr>
                    <th className="border-0 py-3 px-4">Book</th>
                    <th className="border-0 py-3 px-4 text-end">Out</th>
                    <th className="border-0 py-3 px-4">Borrowed on</th>
                    <th className="border-0 py-3 px-4 text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {openBorrows.map((r) => (
                    <tr key={r.borrowId}>
                      <td className="px-4 fw-semibold">{r.bookTitle}</td>
                      <td className="px-4 text-end fw-semibold">{r.remaining}</td>
                      <td className="px-4 text-muted">
                        {new Date(r.firstAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 text-end">
                        <button
                          className="btn btn-sm"
                          onClick={() => handleReturn(r.borrowId, r.remaining)}
                          style={{
                            background: '#fff',
                            color: '#000',
                            border: '1px solid #000',
                            borderRadius: 6,
                            fontWeight: 600,
                          }}
                        >
                          Return
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <BookAvailability books={books} />

      <section>
        <h2 className="h4 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          Your activity history
        </h2>
        <TransactionLog transactions={myHistory} showMember={false} />
      </section>
    </div>
  );
}