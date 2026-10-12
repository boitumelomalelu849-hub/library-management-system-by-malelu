export default function StatCard({ label, value, emphasis = false, hint }) {
  return (
    <div
      className="card border-0 h-100"
      style={{
        background: emphasis ? '#000' : '#fff',
        color: emphasis ? '#fff' : '#000',
        borderRadius: 16,
        boxShadow: emphasis ? '0 10px 24px rgba(0,0,0,.18)' : '0 2px 8px rgba(0,0,0,.04)',
      }}
    >
      <div className="card-body p-4 d-flex flex-column">
        <span
          style={{
            fontSize: '.72rem',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            opacity: emphasis ? 0.7 : 0.55,
            fontWeight: 600,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'Georgia, serif',
            fontWeight: 700,
            fontSize: '2.4rem',
            lineHeight: 1,
            marginTop: 8,
          }}
        >
          {value}
        </span>
        {hint && (
          <span className="mt-2" style={{ fontSize: '.82rem', opacity: emphasis ? 0.7 : 0.6 }}>
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}