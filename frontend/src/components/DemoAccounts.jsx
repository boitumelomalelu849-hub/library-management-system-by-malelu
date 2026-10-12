// Two clickable cards that fill the login form with a demo account.
export default function DemoAccounts({ accounts, activeUsername, onUse }) {
  return (
    <section className="demo-section" aria-labelledby="demo-title">
      <h2 id="demo-title" className="demo-title">Demo accounts</h2>
      <div className="row g-3 demo-grid">
        {accounts.map((a) => {
          const active = a.username === activeUsername;
          return (
            <div className="col-12 col-sm-6" key={a.role}>
              <button type="button" className="demo-card w-100" aria-pressed={active} onClick={() => onUse(a)}>
                <span className="demo-top">
                  <span className="demo-role">{a.label}</span>
                  <span className="demo-state">{active ? 'Selected' : 'Use account'}</span>
                </span>
                <span className="demo-meta">Username: <strong>{a.username}</strong></span>
                <span className="demo-meta">Password: <strong>{a.password}</strong></span>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}