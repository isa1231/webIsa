export default function Footer({ onNavigate }) {
  return (
    <footer className="app-footer">
      <div className="footer-main">
        <section className="footer-about" aria-labelledby="footer-brand">
          <h2 className="footer-brand" id="footer-brand">ShopBella</h2>
          <p>Administra productos, marcas y categorías de tu tienda desde un solo lugar.</p>
        </section>
        <nav className="footer-links" aria-label="Enlaces de la tienda">
          <h3>Tienda</h3>
          <button type="button" onClick={() => onNavigate('products')}>Ver catálogo</button>
          <button type="button" onClick={() => onNavigate('form')}>Administrar productos</button>
        </nav>
        <section className="footer-service" aria-labelledby="footer-service-title">
          <h3 id="footer-service-title">Tu espacio de trabajo</h3>
          <p>Mantén la información de tus productos organizada y actualizada.</p>
        </section>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} ShopBella. Todos los derechos reservados.</span>
        <span>Hecho para que gestionar tu tienda sea más sencillo.</span>
      </div>
    </footer>
  )
}
