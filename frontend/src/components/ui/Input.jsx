import { forwardRef } from 'react'

/**
 * Input — Campo de texto com label, erro e hint integrados.
 *
 * @param {string} label     - Texto da label acima do campo
 * @param {string} error     - Mensagem de erro (exibida em vermelho)
 * @param {string} hint      - Texto de ajuda (exibido quando não há erro)
 * @param {string} className - Classes extras para o input
 */
export const Input = forwardRef(function Input(
  { label, error, hint, className = '', id, ...props },
  ref,
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={[
          'w-full px-3 py-2.5 rounded-lg border text-sm text-gray-900 placeholder-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent',
          'transition-shadow duration-150',
          error ? 'border-red-500 bg-red-50' : 'border-gray-300',
          className,
        ].join(' ')}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
})
