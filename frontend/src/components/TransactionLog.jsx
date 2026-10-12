const fmt = (iso) =>
  new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const typeStyle = (type) => {
  const base = {
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: '.75rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  };
  if (type === 'borrow') return { ...base, background: '#000', color: '#fff', border: '1px solid #000' };
  if (type === 'return') return { ...base, background: '#fff', color: '#000', border: '1px solid #000' };
  return { ...base, background: '#f1f1f1', color: '#000', border: '1px solid #e3e3e3' };
};

const labelFor = (type) => {
  if (type === 'borrow') return 'Borrowed';
  if (type === 'return') return 'Returned';
  return 'Stock added';
};

export default function TransactionLog({ transactions, showMember = true, onDelete }) {
  const cols = showMember ? 7 : 5;
  const totalCols = onDelete ? cols + 1 : cols;

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead style={{ background: '#000', color: '#fff' }}>
            <tr>
              <th className="border-0 py-3 px-4">Date</th>
              <th className="border-0 py-3 px-4">Book</th>
              <th className="border-0 py-3 px-4">Type</th>
              <th className="border-0 py-3 px-4 text-end">Qty</th>
              {showMember && <th className="border-0 py-3 px-4">Member</th>}
              {showMember && <th className="border-0 py-3 px-4">Recorded by</th>}
              <th className="border-0 py-3 px-4">Note</th>
              {onDelete && <th className="border-0 py-3 px-4 text-end">Action</th>}
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={totalCols} className="text-center text-muted py-5">
                  No transactions yet.
                </td>
              </tr>
            )}
            {transactions.map((t) => {
              const sign = t.type === 'borrow' ? '-' : '+';
              return (
                <tr key={t.id}>
                  <td className="px-4 text-muted" style={{ whiteSpace: 'nowrap' }}>{fmt(t.createdAt)}</td>
                  <td className="px-4">{t.bookTitle}</td>
                  <td className="px-4"><span style={typeStyle(t.type)}>{labelFor(t.type)}</span></td>
                  <td className="px-4 text-end fw-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                    {sign}{t.quantity}
                  </td>
                  {showMember && <td className="px-4 text-muted">{t.memberName || 'None'}</td>}
                  {showMember && <td className="px-4 text-muted">{t.recordedBy}</td>}
                  <td className="px-4 text-muted">{t.note || 'None'}</td>
                  {onDelete && (
                    <td className="px-4 text-end">
                      <button
                        className="btn btn-sm"
                        onClick={() => onDelete(t)}
                        style={{
                          background: '#fff',
                          color: '#000',
                          border: '1px solid #000',
                          borderRadius: 6,
                          fontWeight: 600,
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}