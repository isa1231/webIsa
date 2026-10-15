import { useState } from 'react'
import { supabase } from '../supabaseClient'
import PasswordField from './PasswordField'

export default function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        setErrorMsg(error.message)
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'No se pudo iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-screen auth-screen--login">
      <section className="auth-panel">
      <h2>Iniciar Sesión</h2>
      
      {errorMsg && <p className="auth-message auth-message--error" role="alert">{errorMsg}</p>}

      <form className="auth-form" onSubmit={handleLogin}>
        <div className="auth-field">
          <label htmlFor="login-email">Correo electrónico</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="nombre@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <PasswordField
          id="login-password"
          label="Contraseña"
          autoComplete="current-password"
          placeholder="Tu contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>

      <p className="auth-switch">
        ¿No tienes cuenta?{' '}
        <button 
          type="button" 
          onClick={onSwitchToRegister}
          className="switch-link"
        >
          Regístrate aquí
        </button>
      </p>
      </section>
    </main>
  )
}