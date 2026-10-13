import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Login({ onSwitchToRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setErrorMsg(error.message)
    }
    setLoading(false)
  }

  return (
    <main className="auth-screen auth-screen--login">
      <section className="auth-panel">
      <h2>Iniciar Sesión</h2>
      
      {errorMsg && <p className="auth-message auth-message--error" role="alert">{errorMsg}</p>}

      <form className="auth-form" onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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