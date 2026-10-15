import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import './components/style.css'
import './App.css'

function App() {
  const [session, setSession] = useState(null)
  const [currentView, setCurrentView] = useState('login') // 'login' o 'register'

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Si ya hay sesión, mostramos la app protegida (Dashboard)
  if (session) {
    return <Dashboard session={session} />
  }

  // Si no hay sesión, alternamos entre Login y Register según el estado 'currentView'
  return (
    <div className="app-shell">
      {currentView === 'login' ? (
        <Login onSwitchToRegister={() => setCurrentView('register')} />
      ) : (
        <Register onSwitchToLogin={() => setCurrentView('login')} />
      )}
    </div>
  )
}

export default App