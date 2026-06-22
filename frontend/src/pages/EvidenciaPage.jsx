import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadEvidence } from '../services/evidence.service'

export default function EvidenciaPage() {
  const { recordId } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [validationError, setValidationError] = useState('')

  const now = new Date()
  const formattedNow = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (file) => uploadEvidence(file, recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waste-record', recordId] })
      navigate(`/registros/${recordId}`)
    },
  })

  function validateFile(file) {
    const allowed = ['image/jpeg', 'image/png']
    if (!allowed.includes(file.type)) {
      return 'Apenas imagens JPG e PNG são aceitas.'
    }
    if (file.size > 10 * 1024 * 1024) {
      return 'O arquivo excede o tamanho máximo de 10 MB.'
    }
    return null
  }

  function handleFileSelect(file) {
    const error = validateFile(file)
    if (error) {
      setValidationError(error)
      setSelectedFile(null)
      setPreview(null)
      return
    }
    setValidationError('')
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  function handleInputChange(e) {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  function handleDragOver(e) {
    e.preventDefault()
    setDragActive(true)
  }

  function handleDragLeave() {
    setDragActive(false)
  }

  function handleSubmit() {
    if (selectedFile) {
      mutation.mutate(selectedFile)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Upload de evidência</h1>
        <p className="text-sm text-gray-500 mt-1">
          Adicione uma foto do resíduo ou do descarte para comprovar o registro.
        </p>
      </div>

      {/* Info box: timestamp automático */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-green-700 mt-0.5">⏱️</span>
        <div>
          <p className="text-sm font-medium text-green-700">Timestamp automático</p>
          <p className="text-xs text-green-600 mt-0.5">
            A data e hora de upload serão registradas automaticamente:{' '}
            <strong>{formattedNow}</strong>
          </p>
        </div>
      </div>

      {/* Dropzone */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-150 ${
            dragActive
              ? 'border-green-500 bg-green-50'
              : selectedFile
              ? 'border-green-400 bg-green-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          {preview ? (
            <div className="flex flex-col items-center gap-3">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded-lg object-contain"
              />
              <p className="text-sm text-green-700 font-medium">{selectedFile.name}</p>
              <p className="text-xs text-gray-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB · clique para trocar
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <span className="text-4xl">📸</span>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Arraste e solte ou clique para escolher
                </p>
                <p className="text-xs text-gray-500 mt-1">JPG ou PNG · Máximo 10 MB</p>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleInputChange}
          className="hidden"
        />

        {validationError && (
          <p className="mt-2 text-xs text-red-500">{validationError}</p>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-lg border border-gray-300 text-sm transition-colors duration-200"
        >
          Escolher arquivo
        </button>
      </div>

      {/* Erro da mutação */}
      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-600">
            {mutation.error?.response?.data?.detail || 'Erro ao fazer upload. Tente novamente.'}
          </p>
        </div>
      )}

      {/* Botão de envio */}
      {selectedFile && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={mutation.isPending}
          className="w-full bg-green-700 hover:bg-green-800 text-white font-medium py-3 px-4 rounded-lg text-sm transition-colors duration-200 disabled:bg-green-200 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? 'Enviando...' : '📤 Enviar evidência'}
        </button>
      )}

      {/* Link pular */}
      <div className="text-center">
        <Link
          to={`/registros/${recordId}`}
          className="text-sm text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline"
        >
          Pular por agora (não recomendado)
        </Link>
      </div>
    </div>
  )
}
