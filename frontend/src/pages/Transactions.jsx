import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useLibraryData from '../hooks/useLibraryData';
import usePageTitle from '../hooks/usePageTitle';
import TransactionForm from '../components/TransactionForm';
import TransactionLog from '../components/TransactionLog';
import Notice from '../components/Notice';
import { recordTransaction, addNewStock, deleteTransaction } from '../utils/library';

export default function Transactions() {
  usePageTitle('Transactions');
  const { user } = useAuth();
  const { books, users, transactions, refresh } = useLibraryData();
  const [notice, setNotice] = useState({ kind: 'success', text: '' });

  const record = (values) => {
    const result = recordTransaction(user, values);
    if (result.ok) {
      refresh();
      setNotice({ kind: 'success', text: 'Transaction recorded and stock updated.' });
    }
    return result;
  };

  const recordNew = (values) => {
    const result = addNewStock(user, values);
    if (result.ok) {
      refresh();
      setNotice({ kind: 'success', text: 'New book added and stock recorded.' });
    }
    return result;
  };

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
      <div>
        <h1 className="h2 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
          Transactions
        </h1>
        <p className="text-muted mb-0">
          Add stock for existing titles, register a brand-new book, or record a member borrowing.
          Member actions from their dashboard appear here too.
        </p>
      </div>

      <Notice kind={notice.kind}>{notice.text}</Notice>

      <TransactionForm
        books={books}
        users={users}
        onSubmit={record}
        onSubmitNew={recordNew}
      />

      <section>
        <h2 className="h4 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          Transaction history
        </h2>
        <TransactionLog transactions={transactions} onDelete={remove} />
      </section>
    </div>
  );
}