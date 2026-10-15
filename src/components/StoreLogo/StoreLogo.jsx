import { useRef, useState } from 'react'
import { supabase } from '../../supabaseClient'
import { STORE_LOGO_BUCKET, STORE_LOGO_MAX_SIZE, STORE_LOGO_PATH } from './storeLogoConfig'

export default function StoreLogo({ logoUrl, onLogoChange }) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const isJfif = /\.jfif$/i.test(file.name)
    const isImage = file.type.startsWith('image/')
    if (!isImage && !isJfif) {
      setError('Elige un archivo de imagen.')
      return
    }

    if (file.size > STORE_LOGO_MAX_SIZE) {
      setError('La imagen debe pesar 5 MB o menos.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const { error: uploadError } = await supabase.storage
        .from(STORE_LOGO_BUCKET)
        .upload(STORE_LOGO_PATH, file, {
          cacheControl: '3600',
          contentType: isJfif ? 'image/jpeg' : file.type,
          upsert: true,
        })

      if (uploadError) {
        setError(uploadError.message === 'Bucket not found'
          ? `No existe el bucket "${STORE_LOGO_BUCKET}" en Supabase. Ejecuta la migración de Storage para ShopBella y vuelve a intentarlo.`
          : `No se pudo actualizar el logo: ${uploadError.message}`)
        return
      }

      const { data } = supabase.storage.from(STORE_LOGO_BUCKET).getPublicUrl(STORE_LOGO_PATH)
      onLogoChange(`${data.publicUrl}?updated=${Date.now()}`)
    } catch (uploadError) {
      setError(`No se pudo actualizar el logo: ${uploadError instanceof Error ? uploadError.message : 'Inténtalo de nuevo.'}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="store-logo-control">
      <button
        className="store-logo-edit"
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploading ? 'Subiendo...' : logoUrl ? 'Editar logo' : 'Agregar logo'}
      </button>
      <input
        ref={fileInputRef}
        className="store-logo-file"
        type="file"
        accept="image/*,.jfif"
        aria-label="Seleccionar imagen del logo de ShopBella"
        onChange={handleFileChange}
      />
      {error && <span className="store-logo-error" role="alert">{error}</span>}
    </div>
  )
}
