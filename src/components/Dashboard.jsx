import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

const normalizeProductName = (value) => value.trim().toLowerCase()

const sanitizePrice = (value) => {
  const normalized = value.replace(',', '.').replace(/[^\d.]/g, '')
  const [integerPart, ...decimalParts] = normalized.split('.')
  const integer = integerPart || (decimalParts.length ? '0' : '')

  return decimalParts.length
    ? `${integer}.${decimalParts.join('').slice(0, 2)}`
    : integer
}

const sanitizeStock = (value) => value.replace(/\D/g, '')

export default function Dashboard({ session }) {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [categoryError, setCategoryError] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [activePanel, setActivePanel] = useState('products')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteError, setDeleteError] = useState('')
  const [deleting, setDeleting] = useState(false)
  const deleteTriggerRef = useRef(null)
  const deleteDialogRef = useRef(null)
  const deletingRef = useRef(false)

  // Campos del formulario
  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [stock, setStock] = useState('')
  const [imagenUrl, setImagenUrl] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [formError, setFormError] = useState('')
  const [savingProduct, setSavingProduct] = useState(false)

  const queryProductos = () => supabase
      .from('productos')
      .select('*, categorias(nombre)')
      .order('created_at', { ascending: false })

  // 1. LECTURA (Cargar productos)
  const fetchProductos = async () => {
    const { data, error } = await queryProductos()

    if (error) console.error('Error al obtener productos:', error)
    else setProductos(data || [])
    setLoading(false)
  }

  useEffect(() => {
    let active = true

    supabase
      .from('categorias')
      .select('id, nombre')
      .order('nombre', { ascending: true })
      .then(({ data, error }) => {
        if (!active) return
        if (error) setCategoryError(`No se pudieron cargar las categorías: ${error.message}`)
        else setCategorias(data || [])
      })
      .catch((error) => {
        if (active) {
          setCategoryError(`No se pudieron cargar las categorías: ${error instanceof Error ? error.message : 'Inténtalo de nuevo.'}`)
        }
      })

    queryProductos().then(({ data, error }) => {
      if (!active) return
      if (error) console.error('Error al obtener productos:', error)
      else setProductos(data || [])
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  // Limpiar formulario
  const resetForm = () => {
    setNombre('')
    setPrecio('')
    setStock('')
    setImagenUrl('')
    setCategoriaId('')
    setFormError('')
    setEditingId(null)
  }

  // 2. ALTA Y CAMBIOS (Crear o Actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault()
    const cleanName = nombre.trim()
    if (!cleanName) {
      setFormError('Escribe un nombre para el producto.')
      return
    }

    if (!/^\d+(?:\.\d{1,2})?$/.test(precio)) {
      setFormError('El precio debe ser un número positivo con máximo dos decimales.')
      return
    }

    if (!/^\d+$/.test(stock)) {
      setFormError('El stock debe ser un número entero positivo.')
      return
    }

    setSavingProduct(true)
    setFormError('')
    let saved = false

    try {
      const { data: existingProducts, error: checkError } = await supabase
        .from('productos')
        .select('id, nombre')

      if (checkError) {
        setFormError(`No se pudo comprobar el nombre del producto: ${checkError.message}`)
        return
      }

      const duplicate = existingProducts?.some((product) =>
        product.id !== editingId &&
        normalizeProductName(product.nombre) === normalizeProductName(cleanName)
      )

      if (duplicate) {
        setFormError('Ya existe un producto con ese nombre. Elige un nombre diferente.')
        return
      }

      const payload = {
        nombre: cleanName,
        precio: parseFloat(precio),
        stock: parseInt(stock, 10),
        imagen_url: imagenUrl.trim() || null,
        categoria_id: categoriaId ? Number(categoriaId) : null,
        creado_por: session.user.id,
      }

      const { error } = editingId
        ? await supabase.from('productos').update(payload).eq('id', editingId)
        : await supabase.from('productos').insert([payload])

      if (error) {
        setFormError(error.code === '23505'
          ? 'Ya existe un producto con ese nombre. Elige un nombre diferente.'
          : `No se pudo guardar el producto: ${error.message}`)
        return
      }

      resetForm()
      setActivePanel('products')
      saved = true
    } catch (error) {
      setFormError(`No se pudo guardar el producto: ${error instanceof Error ? error.message : 'Inténtalo de nuevo.'}`)
    } finally {
      setSavingProduct(false)
    }

    if (saved) fetchProductos()
  }

  // Cargar datos en el formulario para editar
  const handleEdit = (prod) => {
    setEditingId(prod.id)
    setNombre(prod.nombre)
    setPrecio(String(prod.precio))
    setStock(String(prod.stock))
    setImagenUrl(prod.imagen_url || '')
    setCategoriaId(prod.categoria_id ? String(prod.categoria_id) : '')
    setActivePanel('form')
  }

  // 3. BAJAS (Eliminar)
  const handleDelete = (product, event) => {
    deleteTriggerRef.current = event.currentTarget
    setDeleteError('')
    setDeleteTarget(product)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    deletingRef.current = true
    setDeleting(true)

    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', deleteTarget.id)

      if (error) {
        setDeleteError(`No se pudo eliminar el producto: ${error.message}`)
        return
      }

      setDeleteTarget(null)
      setDeleteError('')
      fetchProductos()
    } catch (error) {
      setDeleteError(`No se pudo eliminar el producto: ${error instanceof Error ? error.message : 'Inténtalo de nuevo.'}`)
    } finally {
      deletingRef.current = false
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (!deleteTarget) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !deletingRef.current) {
        setDeleteTarget(null)
        setDeleteError('')
        return
      }

      if (event.key === 'Tab') {
        const focusable = deleteDialogRef.current?.querySelectorAll('button:not(:disabled)')
        if (!focusable?.length) return

        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      deleteTriggerRef.current?.focus()
    }
  }, [deleteTarget])

  return (
    <main className="dashboard-screen">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="dashboard-brand">
            <h1>Gestión de productos</h1>
            <p>Administra el catálogo de tu tienda en un solo lugar.</p>
          </div>
          <div className="dashboard-account">
            <span className="dashboard-email">{session.user.email}</span>
            <button className="dashboard-signout" onClick={() => supabase.auth.signOut()}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <nav className="dashboard-tabs" role="tablist" aria-label="Panel de productos">
          <button
            id="products-tab"
            className={`dashboard-tab${activePanel === 'products' ? ' dashboard-tab--active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activePanel === 'products'}
            aria-controls="products-panel"
            onClick={() => setActivePanel('products')}
          >
            Catálogo <span className="dashboard-tab-count">{productos.length}</span>
          </button>
          <button
            id="form-tab"
            className={`dashboard-tab${activePanel === 'form' ? ' dashboard-tab--active' : ''}`}
            type="button"
            role="tab"
            aria-selected={activePanel === 'form'}
            aria-controls="form-panel"
            onClick={() => setActivePanel('form')}
          >
            {editingId ? 'Editar producto' : 'Agregar producto'}
          </button>
        </nav>

        {activePanel === 'form' ? (
        <section className="product-form-panel dashboard-tab-panel" id="form-panel" role="tabpanel" aria-labelledby="form-tab">
          <div className="section-heading">
            <span className="section-kicker">{editingId ? 'ACTUALIZA TU CATÁLOGO' : 'NUEVO EN LA TIENDA'}</span>
            <h2>{editingId ? 'Editar producto' : 'Agregar producto'}</h2>
            <p>Completa los datos para mantener tu catálogo al día.</p>
          </div>
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="product-field">
              <label htmlFor="product-name">Nombre del producto</label>
              <input
                id="product-name"
                type="text"
                placeholder="Nombre del producto"
                value={nombre}
                onChange={(e) => {
                  setNombre(e.target.value)
                  setFormError('')
                }}
                required
              />
            </div>
            <div className="product-field">
              <label htmlFor="product-price">Precio</label>
              <input
                id="product-price"
                type="text"
                inputMode="decimal"
                pattern="[0-9]+([.][0-9]{1,2})?"
                placeholder="$0.00"
                value={precio}
                onChange={(e) => setPrecio(sanitizePrice(e.target.value))}
                required
              />
            </div>
            <div className="product-field">
              <label htmlFor="product-stock">Stock disponible</label>
              <input
                id="product-stock"
                type="text"
                inputMode="numeric"
                pattern="[0-9]+"
                placeholder="0"
                value={stock}
                onChange={(e) => setStock(sanitizeStock(e.target.value))}
                required
              />
            </div>
            <div className="product-field">
              <label htmlFor="product-image">Imagen (opcional)</label>
              <input
                id="product-image"
                type="url"
                placeholder="https://..."
                value={imagenUrl}
                onChange={(e) => setImagenUrl(e.target.value)}
              />
            </div>
            <div className="product-field">
              <label htmlFor="product-category">Categoría</label>
              <select
                id="product-category"
                value={categoriaId}
                onChange={(event) => setCategoriaId(event.target.value)}
              >
                <option value="">Sin categoría</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
              {categoryError && <p className="product-field-error" role="alert">{categoryError}</p>}
              {!categoryError && categorias.length === 0 && (
                <p className="product-field-hint">Aún no hay categorías registradas.</p>
              )}
            </div>
            <div className="product-form-actions">
              {formError && <p className="product-form-error" role="alert">{formError}</p>}
              <button className="product-primary-button" type="submit" disabled={savingProduct}>
                {savingProduct ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear producto'}
              </button>
              {editingId && (
                <button
                  className="product-secondary-button"
                  type="button"
                  disabled={savingProduct}
                  onClick={() => {
                    resetForm()
                    setActivePanel('products')
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>
        ) : (
        <section className="product-list-panel dashboard-tab-panel" id="products-panel" role="tabpanel" aria-labelledby="products-tab">
          <div className="section-heading">
                       <h2>Tu catálogo</h2>
            <p>{productos.length} {productos.length === 1 ? 'producto registrado' : 'productos registrados'} en tu tienda.</p>
          </div>
          {loading ? (
            <p className="product-state" role="status">Cargando productos...</p>
          ) : productos.length === 0 ? (
            <p className="product-state">Todavía no hay productos. Agrega el primero desde el formulario.</p>
          ) : (
            <div className="product-table-wrap">
              <table className="product-table">
                <thead>
                  <tr>
                    <th scope="col">Imagen</th>
                    <th scope="col">Nombre</th>
                    <th scope="col">Categoría</th>
                    <th scope="col">Precio</th>
                    <th scope="col">Stock</th>
                    <th scope="col">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((prod) => (
                    <tr key={prod.id}>
                      <td className="product-image-cell">
                        {prod.imagen_url ? (
                          <img src={prod.imagen_url} alt={prod.nombre} width="52" height="52" />
                        ) : (
                          <span className="product-image-placeholder" aria-label="Sin imagen">✿</span>
                        )}
                      </td>
                      <td className="product-name-cell">{prod.nombre}</td>
                      <td>
                        {prod.categorias?.nombre
                          ? <span className="product-category-badge">{prod.categorias.nombre}</span>
                          : <span className="product-category-empty">Sin categoría</span>}
                      </td>
                      <td>${Number(prod.precio).toFixed(2)}</td>
                      <td>{prod.stock}</td>
                      <td>
                        <div className="product-row-actions">
                          <button className="product-edit-button" onClick={() => handleEdit(prod)}>Editar</button>
                          <button className="product-delete-button" onClick={(event) => handleDelete(prod, event)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        )}
      </div>
      {deleteTarget && (
        <div
          className="confirm-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteTarget(null)
              setDeleteError('')
            }
          }}
        >
          <section
            className="confirm-dialog"
            ref={deleteDialogRef}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            aria-describedby="confirm-delete-description"
          >
            <span className="confirm-dialog-icon" aria-hidden="true">!</span>
            <span className="section-kicker">CONFIRMA LA ACCIÓN</span>
            <h2 id="confirm-delete-title">¿Eliminar producto?</h2>
            <p id="confirm-delete-description">
              Se eliminará <strong>{deleteTarget.nombre}</strong> de tu catálogo. Esta acción no se puede deshacer.
            </p>
            {deleteError && <p className="confirm-dialog-error" role="alert">{deleteError}</p>}
            <div className="confirm-dialog-actions">
              <button
                className="product-secondary-button"
                type="button"
                autoFocus
                disabled={deleting}
                onClick={() => {
                  setDeleteTarget(null)
                  setDeleteError('')
                }}
              >
                Conservar producto
              </button>
              <button
                className="confirm-delete-button"
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
              >
                {deleting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}