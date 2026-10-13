import { supabase } from '../supabaseClient'

export default function Dashboard({ session }) {
  return (
    <main className="dashboard-screen">
      <section className="dashboard-panel">
        <h1>¡Bienvenido!</h1>
        <p className="dashboard-email">
          Has iniciado sesión como <strong>{session.user.email}</strong>
        </p>
        <img
          className="dashboard-image"
          src="https://a.storyblok.com/f/178900/1920x1080/74da32e44b/my-hero-academia.jpg/m/1200x0/filters:quality(95)format(webp)"
          alt="Personajes de My Hero Academia"
          width="1200"
          height="675"
        />
        <div className="dashboard-actions">
          <button className="dashboard-signout" onClick={() => supabase.auth.signOut()}>
            Cerrar Sesión
          </button>
        </div>
      </section>
    </main>
  )
}