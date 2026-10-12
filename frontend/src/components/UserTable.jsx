export default function UserTable({ users, currentUserId, onEdit, onDelete }) {
  const roleStyle = (role) =>
    role === 'admin'
      ? {
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: 999,
          fontSize: '.75rem',
          fontWeight: 600,
          background: '#000',
          color: '#fff',
          border: '1px solid #000',
        }
      : {
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: 999,
          fontSize: '.75rem',
          fontWeight: 600,
          background: '#fff',
          color: '#000',
          border: '1px solid #000',
        };

  return (
    <div className="card border-0 shadow-sm" style={{ borderRadius: 16, overflow: 'hidden' }}>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead style={{ background: '#000', color: '#fff' }}>
            <tr>
              <th className="border-0 py-3 px-4">Name</th>
              <th className="border-0 py-3 px-4">Username</th>
              <th className="border-0 py-3 px-4">Membership ID</th>
              <th className="border-0 py-3 px-4">Email</th>
              <th className="border-0 py-3 px-4">Role</th>
              <th className="border-0 py-3 px-4 text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 fw-semibold">{u.name}</td>
                <td className="px-4 text-muted">{u.username}</td>
                <td className="px-4 text-muted" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {u.membershipId}
                </td>
                <td className="px-4 text-muted">{u.email}</td>
                <td className="px-4">
                  <span style={roleStyle(u.role)}>{u.role === 'admin' ? 'Admin' : 'User'}</span>
                </td>
                <td className="px-4 text-end">
                  <div className="d-inline-flex gap-2">
                    <button
                      className="btn btn-sm"
                      onClick={() => onEdit(u)}
                      style={{
                        background: '#000',
                        color: '#fff',
                        border: '1px solid #000',
                        borderRadius: 6,
                        fontWeight: 600,
                      }}
                    >
                      Update
                    </button>
                    <button
                      className="btn btn-sm"
                      onClick={() => onDelete(u)}
                      disabled={u.id === currentUserId}
                      title={u.id === currentUserId ? 'You cannot delete your own account' : undefined}
                      style={{
                        background: '#fff',
                        color: '#000',
                        border: '1px solid #000',
                        borderRadius: 6,
                        fontWeight: 600,
                        opacity: u.id === currentUserId ? 0.4 : 1,
                        cursor: u.id === currentUserId ? 'not-allowed' : 'pointer',
                      }}
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