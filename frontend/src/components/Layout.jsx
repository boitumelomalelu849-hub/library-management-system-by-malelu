import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="d-flex flex-column min-vh-100" style={{ background: '#f6f6f7' }}>
      <Navbar />
      <main className="flex-grow-1">
        <div className="container py-4 py-lg-5" style={{ maxWidth: 1100 }}>
          <Outlet />
        </div>
      </main>
      <footer
        className="text-center py-3 mt-auto"
        style={{ background: '#fff', borderTop: '1px solid #e9e9ec', color: '#6b6b6b', fontSize: '.85rem' }}
      >
        Community Library · {new Date().getFullYear()}
      </footer>
    </div>
  );
}