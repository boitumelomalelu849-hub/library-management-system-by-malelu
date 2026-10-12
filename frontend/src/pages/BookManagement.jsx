import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useLibraryData from '../hooks/useLibraryData';
import usePageTitle from '../hooks/usePageTitle';
import BookForm from '../components/BookForm';
import BookTable from '../components/BookTable';
import Notice from '../components/Notice';
import { addBook, updateBook, deleteBook } from '../utils/library';

export default function BookManagement() {
  usePageTitle('Book management');
  const { user } = useAuth();
  const { books, refresh } = useLibraryData();
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState({ kind: 'success', text: '' });

  const save = (values) => {
    const result = editing ? updateBook(user, editing.id, values) : addBook(user, values);
    if (result.ok) {
      refresh();
      setNotice({ kind: 'success', text: editing ? 'Book updated.' : 'Book added.' });
      setEditing(null);
    }
    return result;
  };

  const remove = (book) => {
    if (!window.confirm(`Delete "${book.title}"? This cannot be undone.`)) return;
    const result = deleteBook(user, book.id);
    if (result.ok) {
      if (editing?.id === book.id) setEditing(null);
      refresh();
      setNotice({ kind: 'success', text: 'Book deleted.' });
    } else {
      setNotice({ kind: 'error', text: result.error });
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3">
        <div>
          <h1 className="h2 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            Book management
          </h1>
          <p className="text-muted mb-0">Add, update or remove titles from the catalogue.</p>
        </div>
      </div>

      <Notice kind={notice.kind}>{notice.text}</Notice>

      <BookForm
        key={editing?.id ?? 'new'}
        initial={editing}
        onSubmit={save}
        onCancel={() => setEditing(null)}
      />

      <section>
        <h2 className="h4 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          All books
        </h2>
        <BookTable
          books={books}
          onEdit={(b) => {
            setEditing(b);
            setNotice({ kind: 'success', text: '' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDelete={remove}
        />
      </section>
    </div>
  );
}