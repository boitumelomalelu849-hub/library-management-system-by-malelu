import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useLibraryData from '../hooks/useLibraryData';
import usePageTitle from '../hooks/usePageTitle';
import StatCard from '../components/StatCard';
import BookAvailability from '../components/BookAvailability';
import TransactionLog from '../components/TransactionLog';
import Notice from '../components/Notice';
import { LOW_STOCK_LIMIT, deleteTransaction } from '../utils/library';
import { useState } from 'react';

export default function AdminDashboard() {
  usePageTitle('Admin dashboard');
  const { user } = useAuth();
  const { books, users, transactions, refresh } = useLibraryData();
  const [notice, setNotice] = useState({ kind: 'success', text: '' });

  const copies = books.reduce((sum, b) => sum + b.quantity, 0);
  const low = books.filter((b) => b.quantity < LOW_STOCK_LIMIT).length;

  const remove = (t) => {
    if (!window.confirm(`Delete this transaction?\n\n${t.bookTitle} · ${t.type} ${t.quantity}\n\nStock will be adjusted to match.`)) return;
    const result = deleteTransaction(user, t.id);
    if (result.ok) {
      refresh();
      setNotice({ kind: 'success', text: 'Transaction deleted and stock adjusted.' });
    } else {
      setNotice({ kind: 'error', text: result.error });
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3">
        <div>
          <h1 className="h2 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            Admin dashboard
          </h1>
          <p className="text-muted mb-0">
            Signed in as <strong className="text-dark">{user.username}</strong>
          </p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link
            to="/admin/books"
            className="btn"
            style={{ background: '#000', color: '#fff', border: '2px solid #000', borderRadius: 999, padding: '.55rem 1.3rem', fontWeight: 600 }}
          >
            Manage books
          </Link>
          <Link
            to="/admin/transactions"
            className="btn"
            style={{ background: '#fff', color: '#000', border: '2px solid #000', borderRadius: 999, padding: '.55rem 1.3rem', fontWeight: 600 }}
          >
            Record transaction
          </Link>
        </div>
      </div>

      <Notice kind={notice.kind}>{notice.text}</Notice>

      <div className="row g-3">
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard label="Book titles" value={books.length} />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard label="Copies in stock" value={copies} />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard
            label="Low stock titles"
            value={low}
            emphasis={low > 0}
            hint={low > 0 ? 'Fewer than 2 copies' : 'All titles healthy'}
          />
        </div>
        <div className="col-12 col-sm-6 col-lg-3">
          <StatCard label="Members and staff" value={users.length} />
        </div>
      </div>

      <BookAvailability books={books} />

      <section>
        <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
          <h2 className="h4 mb-0" style={{ fontFamily: 'Georgia, serif' }}>
            Recent transactions
          </h2>
          <Link
            to="/admin/transactions"
            className="btn btn-sm"
            style={{ background: '#fff', color: '#000', border: '1px solid #000', borderRadius: 999, padding: '.35rem 1rem', fontWeight: 600 }}
          >
            View all
          </Link>
        </div>
        <TransactionLog transactions={transactions.slice(0, 5)} onDelete={remove} />
      </section>
    </div>
  );
}