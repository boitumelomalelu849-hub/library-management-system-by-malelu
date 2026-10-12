import { useMemo, useState } from 'react';
import { LOW_STOCK_LIMIT } from '../utils/library';

export function stockStatus(quantity) {
  if (quantity === 0) return 'Out of stock';
  if (quantity < LOW_STOCK_LIMIT) return 'Low stock';
  return 'In stock';
}

const tagStyle = (quantity) => {
  const base = {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: '.75rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  };
  if (quantity === 0) return { ...base, background: '#fff', color: '#000', border: '1px solid #000' };
  if (quantity < LOW_STOCK_LIMIT) return { ...base, background: '#000', color: '#fff', border: '1px solid #000' };
  return { ...base, background: '#f1f1f1', color: '#000', border: '1px solid #e3e3e3' };
};

// Table of current availability. Books with fewer than 2 copies are highlighted.
export default function BookAvailability({ books }) {
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q
      ? books.filter((b) =>
          [b.title, b.author, b.genre, b.isbn].some((v) => v.toLowerCase().includes(q))
        )
      : books;
  }, [books, query]);

  return (
    <section aria-labelledby="availability-title">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
        <h2 id="availability-title" className="h4 mb-0" style={{ fontFamily: 'Georgia, serif' }}>
          Book availability
        </h2>
        <input
          type="search"
          className="form-control"
          placeholder="Search title, author or ISBN"
          aria-label="Search books"
          value={query}
          maxLength={60}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 300, borderRadius: 999, border: '1px solid #d0d0d0' }}
        />
      </div>

      <div
        className="card border-0 shadow-sm"
        style={{ borderRadius: 16, overflow: 'hidden' }}
      >
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead style={{ background: '#000', color: '#fff' }}>
              <tr>
                <th className="border-0 py-3 px-4">Title</th>
                <th className="border-0 py-3 px-4">Author</th>
                <th className="border-0 py-3 px-4">Genre</th>
                <th className="border-0 py-3 px-4 text-end">Copies</th>
                <th className="border-0 py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-5">
                    {books.length === 0
                      ? 'No books have been added yet.'
                      : 'No books match your search.'}
                  </td>
                </tr>
              )}
              {shown.map((b) => (
                <tr
                  key={b.id}
                  style={
                    b.quantity < LOW_STOCK_LIMIT
                      ? { borderLeft: '4px solid #000', fontWeight: 500 }
                      : undefined
                  }
                >
                  <td className="px-4">{b.title}</td>
                  <td className="px-4 text-muted">{b.author}</td>
                  <td className="px-4 text-muted">{b.genre}</td>
                  <td className="px-4 text-end fw-semibold">{b.quantity}</td>
                  <td className="px-4">
                    <span style={tagStyle(b.quantity)}>{stockStatus(b.quantity)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}