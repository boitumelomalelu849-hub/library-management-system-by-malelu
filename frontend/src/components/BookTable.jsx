import { LOW_STOCK_LIMIT } from '../utils/library';

export default function BookTable({ books, onEdit, onDelete }) {
  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead style={{ background: '#000', color: '#fff' }}>
            <tr>
              <th className="border-0 py-3 px-4">Title</th>
              <th className="border-0 py-3 px-4">Author</th>
              <th className="border-0 py-3 px-4">Genre</th>
              <th className="border-0 py-3 px-4">ISBN</th>
              <th className="border-0 py-3 px-4 text-end">Copies</th>
              <th className="border-0 py-3 px-4 text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-muted py-5">
                  No books yet. Add the first one above.
                </td>
              </tr>
            )}
            {books.map((b) => (
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
                <td className="px-4 text-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>{b.isbn}</td>
                <td className="px-4 text-end fw-semibold">{b.quantity}</td>
                <td className="px-4 text-end">
                  <div className="d-inline-flex gap-2">
                    <button
                      className="btn btn-sm"
                      onClick={() => onEdit(b)}
                      style={{ background: '#000', color: '#fff', border: '1px solid #000', borderRadius: 6, fontWeight: 600 }}
                    >
                      Update
                    </button>
                    <button
                      className="btn btn-sm"
                      onClick={() => onDelete(b)}
                      style={{ background: '#fff', color: '#000', border: '1px solid #000', borderRadius: 6, fontWeight: 600 }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}