import { useEffect, useState } from 'react'
import api from '../../lib/axios'

/**
 * Renderiza uma imagem de evidência buscando-a via requisição autenticada (Bearer token).
 * Isso impede que a URL da imagem seja acessível sem autenticação.
 *
 * Props:
 *   - evidenceId: UUID da evidência
 *   - alt: texto alternativo da imagem
 *   - fileName: nome do arquivo (para o download)
 *   - className: classes CSS adicionais para o <img>
 */
export default function AuthenticatedImage({ evidenceId, alt, fileName, className }) {
  const [blobUrl, setBlobUrl] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let objectUrl = null

    api
      .get(`/evidence/${evidenceId}/file`, { responseType: 'blob' })
      .then((response) => {
        objectUrl = URL.createObjectURL(response.data)
        setBlobUrl(objectUrl)
      })
      .catch(() => {
        setError(true)
      })

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [evidenceId])

  if (error) {
    return (
      <div className="w-full h-28 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
        <span className="text-xs text-gray-400">Erro ao carregar</span>
      </div>
    )
  }

  if (!blobUrl) {
    return (
      <div className="w-full h-28 bg-gray-100 rounded-lg border border-gray-200 animate-pulse" />
    )
  }

  return (
    <a href={blobUrl} download={fileName} className="block">
      <img
        src={blobUrl}
        alt={alt}
        className={className}
      />
    </a>
  )
}
