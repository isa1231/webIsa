import { useState } from 'react'
import { supabase } from '../supabaseClient'
import PasswordField from './PasswordField'

export default function Register({ onSwitchToLogin }) {
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nombre: nombre.trim(),
          },
        },
      })

      if (error) {
        setErrorMsg(error.message)
      } else if (data.session) {
        setSuccessMsg('¡Registro exitoso! Tu cuenta ya está lista.')
      } else {
        setSuccessMsg('Registro recibido. Revisa tu correo para confirmar la cuenta antes de iniciar sesión.')
      }
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'No se pudo completar el registro. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-screen auth-screen--register">
      <section className="auth-panel">
      <h2>Registro</h2>
      
      {errorMsg && <p className="auth-message auth-message--error" role="alert">{errorMsg}</p>}
      {successMsg && <p className="auth-message auth-message--success" role="status">{successMsg}</p>}

      <form className="auth-form" onSubmit={handleRegister}>
        <div className="auth-field">
          <label htmlFor="register-name">Nombre</label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="auth-field">
          <label htmlFor="register-email">Correo electrónico</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="nombre@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <PasswordField
          id="register-password"
          label="Contraseña"
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="auth-submit" type="submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <p className="auth-switch">
        ¿Ya tienes una cuenta?{' '}
        <button 
          type="button" 
          onClick={onSwitchToLogin}
          className="switch-link"
        >
          Inicia sesión aquí
        </button>
      </p>
      </section>
    </main>
  )
}