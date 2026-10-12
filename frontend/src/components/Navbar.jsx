import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/books', label: 'Books' },
  { to: '/admin/transactions', label: 'Transactions' },
  { to: '/admin/users', label: 'Users' },
];
const USER_LINKS = [
  { to: '/dashboard', label: 'Dashboard', end: true },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const links = user.role === 'admin' ? ADMIN_LINKS : USER_LINKS;

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark sticky-top"
      style={{ background: '#000', borderBottom: '1px solid #1a1a1a' }}
    >
      <div className="container" style={{ maxWidth: 1100 }}>
        <Link
          to="/"
          className="navbar-brand fw-bold"
          style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.01em' }}
        >
          Community Library
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            {links.map((l) => (
              <li className="nav-item" key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.end}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    'nav-link px-3' + (isActive ? ' fw-semibold text-white' : ' text-white-50')
                  }
                  style={({ isActive }) =>
                    isActive ? { borderBottom: '2px solid #fff' } : { borderBottom: '2px solid transparent' }
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="d-flex align-items-center gap-3">
            <span className="text-white-50 small">
              <span className="text-white fw-semibold">{user.username}</span>
              <span
                className="badge ms-2"
                style={{
                  border: '1px solid #fff',
                  background: user.role === 'admin' ? '#fff' : 'transparent',
                  color: user.role === 'admin' ? '#000' : '#fff',
                  fontWeight: 600,
                }}
              >
                {user.role === 'admin' ? 'Admin' : 'User'}
              </span>
            </span>
            <button
              className="btn btn-sm"
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid #fff',
                borderRadius: 6,
                padding: '0.35rem 0.9rem',
              }}
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}