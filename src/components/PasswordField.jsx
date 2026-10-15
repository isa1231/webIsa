import { useState } from 'react'

export default function PasswordField({
  id,
  label,
  autoComplete,
  placeholder,
  value,
  onChange,
  minLength,
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="password-input-wrap">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          minLength={minLength}
          value={value}
          onChange={onChange}
          required
        />
        <button
          className="password-toggle"
          type="button"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" />
              <path d="M9.9 5.2A10.8 10.8 0 0112 5c5.5 0 9 7 9 7a14.8 14.8 0 01-3.1 3.8M6.2 6.2C3.9 7.8 3 12 3 12s3.5 7 9 7a9.8 9.8 0 004-.8" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z" />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
