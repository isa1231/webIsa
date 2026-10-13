import { useState } from 'react'
import { supabase } from '../supabaseClient'

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

    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          nombre: nombre, 
        }
      }
    })
    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg('¡Registro exitoso! Ya puedes iniciar sesión.')
      setTimeout(() => {
        onSwitchToLogin() 
      }, 2000)
    }
    setLoading(false)
  }

  return (
    <main className="auth-screen auth-screen--register">
      <section className="auth-panel">
      <h2>Registro</h2>
      
      {errorMsg && <p className="auth-message auth-message--error" role="alert">{errorMsg}</p>}
      {successMsg && <p className="auth-message auth-message--success" role="status">{successMsg}</p>}

      <form className="auth-form" onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
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