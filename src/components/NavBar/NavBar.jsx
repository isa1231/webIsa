import { useState } from 'react'
import ProductSearch from '../ProductSearch/ProductSearch'
import StoreLogo from '../StoreLogo/StoreLogo'

function BrandMark({ logoUrl }) {
  const [logoLoadError, setLogoLoadError] = useState(false)

  return (
    <span className="navbar-brand-mark">
      {logoUrl && !logoLoadError
        ? <img src={logoUrl} alt="" onError={() => setLogoLoadError(true)} />
        : <span aria-hidden="true">S</span>}
    </span>
  )
}

export default function NavBar({
  activePanel,
  email,
  logoUrl,
  onNavigate,
  onSignOut,
  onLogoChange,
  searchValue,
  onSearch,
}) {
  return (
    <header className="app-navbar">
      <div className="navbar-main">
        <div className="navbar-brand-group">
          <button className="navbar-brand" type="button" onClick={() => onNavigate('products')}>
            <BrandMark key={logoUrl} logoUrl={logoUrl} />
            <span>
              <strong>ShopBella</strong>
              <small>Tu tienda, tu estilo</small>
            </span>
          </button>
          <StoreLogo logoUrl={logoUrl} onLogoChange={onLogoChange} />
        </div>

        <ProductSearch value={searchValue} onChange={onSearch} />

        <div className="navbar-account">
          <span className="navbar-email" title={email}>{email}</span>
          <button className="navbar-signout" type="button" onClick={onSignOut}>
            Salir
          </button>
        </div>
      </div>

      <nav className="navbar-links" aria-label="Navegación principal">
        <button
          className={activePanel === 'products' ? 'navbar-link navbar-link--active' : 'navbar-link'}
          type="button"
          aria-current={activePanel === 'products' ? 'page' : undefined}
          onClick={() => onNavigate('products')}
        >
          Catálogo
        </button>
        <button
          className={activePanel === 'form' ? 'navbar-link navbar-link--active' : 'navbar-link'}
          type="button"
          aria-current={activePanel === 'form' ? 'page' : undefined}
          onClick={() => onNavigate('form')}
        >
          Agregar producto
        </button>
      </nav>
    </header>
  )
}
