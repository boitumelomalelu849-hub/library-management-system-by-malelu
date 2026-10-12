// Shared layout for Login, Register and Forgot password.
// A black stage with slow-moving light, one white Bootstrap card for the form,
// and an optional `below` area (used for demo accounts).

function Mark() {
  return (
    <svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true" focusable="false">
      <rect x="3" y="6" width="6" height="19" rx="1" fill="#fff" />
      <rect x="12" y="3" width="6" height="22" rx="1" fill="none" stroke="#fff" strokeWidth="2" />
      <rect x="21" y="8" width="6" height="17" rx="1" transform="rotate(8 24 25)" fill="#fff" />
    </svg>
  );
}

export default function AuthShell({ title, subtitle, children, footer, below }) {
  return (
    <div className="auth-page min-vh-100 d-flex align-items-center justify-content-center px-3 py-5">
      <div className="glow glow-a" aria-hidden="true" />
      <div className="glow glow-b" aria-hidden="true" />
      <div className="grid-bg" aria-hidden="true" />

      <div className="auth-wrap w-100">
        <div className="brand-mark d-flex align-items-center justify-content-center gap-2 mb-4">
          <Mark />
          <span>Community Library</span>
        </div>

        <main className="card border-0 shadow-lg auth-card">
          <div className="card-body p-4 p-sm-5">
            <h1 className="auth-title">{title}</h1>
            {subtitle && <p className="subtitle">{subtitle}</p>}
            {children}
            {footer && <div className="auth-footer">{footer}</div>}
          </div>
        </main>

        {below}
      </div>
    </div>
  );
}