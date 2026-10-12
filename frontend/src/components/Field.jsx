import { useId, useState } from 'react';

// Labelled Bootstrap form control with inline error, hint and a show/hide toggle for passwords.
export default function Field({ label, error, hint, type = 'text', as = 'input', children, ...props }) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const common = { id, 'aria-invalid': Boolean(error), 'aria-describedby': describedBy, ...props };

  return (
    <div className="field">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      <div className="field-control">
        {as === 'select' ? (
          <select {...common} className="form-select">
            {children}
          </select>
        ) : (
          <input {...common} className="form-control" type={isPassword && show ? 'text' : type} />
        )}
        {isPassword && (
          <button type="button" className="toggle" onClick={() => setShow((s) => !s)}>
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}