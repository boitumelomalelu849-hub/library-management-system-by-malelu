import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import useLibraryData from '../hooks/useLibraryData';
import usePageTitle from '../hooks/usePageTitle';
import UserForm from '../components/UserForm';
import UserTable from '../components/UserTable';
import Notice from '../components/Notice';
import { addUser, updateUser, deleteUser } from '../utils/library';

export default function UserManagement() {
  usePageTitle('User management');
  const { user } = useAuth();
  const { users, refresh } = useLibraryData();
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState({ kind: 'success', text: '' });

  const save = async (values) => {
    const result = editing
      ? await updateUser(user, editing.id, values)
      : await addUser(user, values);
    if (result.ok) {
      refresh();
      setNotice({ kind: 'success', text: editing ? 'User updated.' : 'User added.' });
      setEditing(null);
    }
    return result;
  };

  const remove = (target) => {
    if (!window.confirm(`Delete ${target.name} (${target.username})? This cannot be undone.`)) return;
    const result = deleteUser(user, target.id);
    if (result.ok) {
      if (editing?.id === target.id) setEditing(null);
      refresh();
      setNotice({ kind: 'success', text: 'User deleted.' });
    } else {
      setNotice({ kind: 'error', text: result.error });
    }
  };

  return (
    <div className="d-flex flex-column gap-4">
      <div>
        <h1 className="h2 mb-1" style={{ fontFamily: 'Georgia, serif' }}>
          User management
        </h1>
        <p className="text-muted mb-0">Add staff or members, edit their details or remove accounts.</p>
      </div>

      <Notice kind={notice.kind}>{notice.text}</Notice>

      <UserForm
        key={editing?.id ?? 'new'}
        initial={editing}
        isSelf={editing?.id === user.id}
        onSubmit={save}
        onCancel={() => setEditing(null)}
      />

      <section>
        <h2 className="h4 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
          All users
        </h2>
        <UserTable
          users={users}
          currentUserId={user.id}
          onEdit={(u) => {
            setEditing(u);
            setNotice({ kind: 'success', text: '' });
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDelete={remove}
        />
      </section>
    </div>
  );
}