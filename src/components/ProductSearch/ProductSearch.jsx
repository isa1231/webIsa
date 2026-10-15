export default function ProductSearch({ value, onChange }) {
  return (
    <label className="navbar-search">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="10.8" cy="10.8" r="6.3" />
        <path d="m15.5 15.5 4.2 4.2" />
      </svg>
      <input
        type="text"
        inputMode="search"
        aria-label="Buscar productos, marcas o categorías"
        placeholder="Buscar producto, marca o categoría..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          className="navbar-search-clear"
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange('')}
        >
          ×
        </button>
      )}
    </label>
  )
}
